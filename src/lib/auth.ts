import { randomBytes } from "crypto";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

const isProduction = process.env.NODE_ENV === "production";

function getProfileImage(profile: unknown): string | null {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const record = profile as Record<string, unknown>;
  const candidateKeys = [
    "avatar_url",
    "picture",
    "image",
    "avatarUrl",
    "avatar",
  ];

  for (const key of candidateKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function ensureSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (isProduction) {
      throw new Error(
        "NEXTAUTH_SECRET is required in production environments.",
      );
    }
    console.warn(
      "NEXTAUTH_SECRET not set. Falling back to a generated secret for this session.",
    );
    return randomBytes(32).toString("hex");
  }
  return secret;
}

const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
const isSecureCookie = appUrl.startsWith("https://") || isProduction;

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });

      if (!user?.hashedPassword) {
        return null;
      }

      const isPasswordValid = await compare(
        credentials.password,
        user.hashedPassword,
      );

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? user.username,
        image: user.image ?? user.avatarUrl ?? null,
        avatarUrl: user.avatarUrl ?? undefined,
      };
    },
  }),
];

const githubClientId = process.env.GITHUB_ID ?? process.env.GITHUB_CLIENT_ID;
const githubClientSecret =
  process.env.GITHUB_SECRET ?? process.env.GITHUB_CLIENT_SECRET;
if (githubClientId && githubClientSecret) {
  providers.push(
    GitHubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }),
  );
} else if (isProduction) {
  console.warn(
    "GitHub OAuth environment variables are missing. GitHub login will be disabled.",
  );
}

const googleClientId = process.env.GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  );
} else if (isProduction) {
  console.warn(
    "Google OAuth environment variables are missing. Google login will be disabled.",
  );
}

const authEvents: NonNullable<NextAuthOptions["events"]> = {
  signIn: async () => {
    if (isProduction && !process.env.NEXTAUTH_URL) {
      console.warn(
        "Warning: NEXTAUTH_URL is not set in production. Set it to your deployed URL.",
      );
    }
  },
  createUser: async ({ user }) => {
    try {
      if (!user?.id) return;
      const existing = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          image: true,
        },
      });
      if (!existing) return;

      const updates: {
        image?: string | null;
        avatarUrl?: string | null;
      } = {};
      const sourceImage =
        (typeof user.image === "string" && user.image) ||
        existing.image ||
        existing.avatarUrl ||
        null;

      if (!existing.image && sourceImage) {
        updates.image = sourceImage;
      }

      if (!existing.avatarUrl && sourceImage) {
        updates.avatarUrl = sourceImage;
      }

      const base = (existing.email ?? "user").split("@")[0];
      const clean =
        base
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_.-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 30) || "user";

      if (!existing.username || /^[a-z0-9]{25,}$/i.test(existing.username)) {
        let candidate = clean;
        let suffix = 0;
        for (;;) {
          const username = suffix ? `${candidate}${suffix}` : candidate;
          const clash = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
          });
          if (!clash) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { username },
            });
            break;
          }
          suffix += 1;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: existing.id },
          data: updates,
        });
      }
    } catch (error) {
      console.warn("createUser username enrichment failed", error);
    }
  },
};

const authCallbacks: NextAuthOptions["callbacks"] = {
  async signIn({ user, account, profile }) {
    try {
      if (!account) {
        return true;
      }

      if (account.type === "oauth") {
        const emailFromProfile =
          (typeof profile === "object" && profile?.email) || undefined;
        const email = user.email ?? emailFromProfile;
        if (!email) {
          console.error(
            `OAuth sign-in missing email for provider ${account.provider}`,
          );
          return "/auth/sign-in?error=missing_email";
        }

        const normalizedEmail = email.toLowerCase();
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            avatarUrl: true,
            image: true,
            name: true,
          },
        });

        const profileImage = getProfileImage(profile) ?? user.image ?? null;

        if (existingUser) {
          user.id = existingUser.id;

          const updates: {
            image?: string | null;
            avatarUrl?: string | null;
            name?: string | null;
          } = {};
          if (profileImage) {
            if (profileImage !== existingUser.image) {
              updates.image = profileImage;
            }
            if (profileImage !== existingUser.avatarUrl) {
              updates.avatarUrl = profileImage;
            }
          }
          if (!existingUser.name && user.name) {
            updates.name = user.name;
          }

        if (Object.keys(updates).length > 0) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: updates,
          });
        }
        } else if (profileImage) {
          user.image = profileImage;
        }
      }

      return true;
    } catch (error) {
      console.error("Sign-in callback failed", error);
      return "/auth/sign-in?error=oauth_error";
    }
  },
  async jwt({ token, user }) {
    if (user?.id) {
      token.id = user.id;
    }

    if (user && "username" in user && user.username && !token.username) {
      token.username = user.username as string;
    }

    if (user && "role" in user && user.role && !token.role) {
      token.role = user.role as string;
    }

    if (!token.picture) {
      if (user && "image" in user && typeof user.image === "string") {
        token.picture = user.image;
      } else if (
        user &&
        "avatarUrl" in user &&
        typeof user.avatarUrl === "string"
      ) {
        token.picture = user.avatarUrl;
      }
    }

    if (!token.id && token.sub) {
      token.id = token.sub;
    }

    if (token.id && (!token.username || !token.role || !token.picture)) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          username: true,
          role: true,
          avatarUrl: true,
          image: true,
        },
      });

      if (dbUser) {
        token.username = dbUser.username;
        token.role = dbUser.role;
        token.picture =
          (token.picture as string | null | undefined) ??
          dbUser.image ??
          dbUser.avatarUrl ??
          null;
      }
    }

    return token;
  },
  async session({ session, token }) {
    if (!session.user || !token.id) {
      return session;
    }

    session.user = {
      ...session.user,
      id: token.id as string,
      username: token.username as string | undefined,
      role: token.role as string | undefined,
    };

    const tokenPicture =
      typeof token.picture === "string" ? token.picture : null;
    session.user.image = tokenPicture ?? session.user.image ?? null;

    if (!session.user.username || !session.user.role || !session.user.image) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          username: true,
          role: true,
          avatarUrl: true,
          image: true,
          name: true,
        },
      });

      if (dbUser) {
        session.user.username = dbUser.username;
        session.user.role = dbUser.role;
        session.user.name = session.user.name ?? dbUser.name ?? undefined;
        session.user.image =
          session.user.image ?? dbUser.image ?? dbUser.avatarUrl ?? null;
      }
    }

    return session;
  },
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: ensureSecret(),
  cookies: {
    sessionToken: {
      name: isSecureCookie
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  events: authEvents,
  callbacks: authCallbacks,
  logger: {
    error(code, metadata) {
      console.error("NextAuth logger error", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth logger warn", code);
    },
  },
  providers,
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (dbUser?.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}
