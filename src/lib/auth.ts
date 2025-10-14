import { randomBytes } from "crypto";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

function ensureSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  secret: ensureSecret(),
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
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

        if (!user) {
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
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      const resolvedUser =
        user ??
        (session.user.email
          ? await prisma.user.findUnique({
              where: { email: session.user.email.toLowerCase() },
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                avatarUrl: true,
              },
            })
          : null);

      if (resolvedUser) {
        session.user = {
          ...session.user,
          id: resolvedUser.id,
        } as DefaultSession["user"] & { id: string };
      }

      return session;
    },
  },
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
