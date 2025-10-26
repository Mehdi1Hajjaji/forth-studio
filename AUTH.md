Authentication and Authorization Design

Stack
- Framework: Next.js (App Router)
- Auth library: NextAuth.js with credentials provider (email + password)
- ORM: Prisma (PostgreSQL)
- Hashing: bcryptjs
- Session: JWT strategy (stateless)

Data model (Prisma)
- User
  - role: enum Role = STUDENT | MENTOR | INVESTOR | ADMIN
  - xp: Int (default 0)
  - universityId: optional relation to University
- VerificationToken: reused to store password‑reset tokens

Where to look
- Config: src/lib/auth.ts
- API
- POST /api/register — create a user (email + password, optional username, role)
  - POST /api/auth/request-reset — request a reset link
  - POST /api/auth/reset-password — finalize password change
- Pages
  - Sign in: src/app/(auth)/auth/sign-in
- Sign up: src/app/(auth)/auth/sign-up (email/password + username + role picker)
- Account settings: src/app/(user)/settings (profile + password forms)
  - Forgot password: src/app/(auth)/auth/forgot-password
  - Reset password: src/app/auth/reset
- Protection
- Middleware: middleware.ts (protects /dashboard, /submit, /stories/new, /projects/new, /settings)
  - Server helpers: getCurrentUser / requireUser in src/lib/auth.ts

Flows
1) Sign up
   - Client posts to /api/register with { email, password, name?, username?, role }
   - Server validates (Zod), enforces unique email + username, hashes password, generates a fallback username when not provided, persists chosen role (defaults to STUDENT)
   - Client signs in via next-auth credentials and redirects

2) Sign in
   - NextAuth credentials checks email + hashedPassword via bcryptjs
   - JWT session; user id is attached to session.user

3) Forgot / Reset password
   - Request: POST /api/auth/request-reset with { email }
   - Server records VerificationToken(identifier=email, token, expires=+1h)
   - Reset email sent via Resend (configure RESEND_API_KEY and RESEND_FROM_EMAIL)
   - Reset: POST /api/auth/reset-password with { email, token, newPassword }
   - Server validates token, updates user.hashedPassword, deletes token

Authorization integration
- Public pages: landing, public listings
- Protected routes (via middleware): core user areas (/dashboard, /submit, /stories/new, /projects/new, /settings)
- API endpoints enforce auth for interactions:
  - /api/comments — POST requires user; GET is public
  - /api/submissions — POST requires user; GET is public
  - /api/stories — GET is public (publishing would require auth when added)

Extending
- Add more roles: extend enum Role in schema.prisma and adjust any role checks
- Add fields to User: update schema + any select clauses; run Prisma migrate
- Extend email delivery by enabling your transactional provider. Resend is wired by default (see src/lib/email.ts).

Local setup
1) Ensure DATABASE_URL is set in .env
2) Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env for password reset emails
3) Update prisma: npx prisma migrate dev (adds INVESTOR + xp)
4) Dev server: npm run dev

Environments & Vercel setup
- Local development (.env):
  - NEXTAUTH_URL=http://localhost:3000
  - NEXT_PUBLIC_APP_URL=http://localhost:3000
  - Use a local DATABASE_URL (do NOT point to production)
  - Keep NEXTAUTH_SECRET set locally for stable sessions
- Vercel Production/Preview (Project Settings → Environment Variables):
  - NEXTAUTH_URL=https://forth.studio (or your Vercel domain for previews)
  - NEXT_PUBLIC_APP_URL=https://forth.studio
  - NEXTAUTH_SECRET=generate with: openssl rand -base64 32
  - DATABASE_URL=your production Postgres connection string
  - RESEND_API_KEY and RESEND_FROM_EMAIL if sending emails

Troubleshooting auth
- Redirects from localhost to production: check NEXTAUTH_URL in your running environment; it must be http://localhost:3000 for local dev.
- Login/sign-up failing on production: verify NEXTAUTH_URL and NEXTAUTH_SECRET are set in Vercel, and that DATABASE_URL is reachable. Use /api/auth/debug to inspect.
- Session loops: ensure cookies aren’t forced to a fixed domain; we rely on default domain and set SameSite=lax with secure cookies on HTTPS only.

Security notes
- Credentials flow validates inputs with Zod and never reveals whether an email exists during reset requests
- Passwords are hashed with bcryptjs (10 rounds); adjust as needed
- Tokens expire in 1 hour and are removed after use
- NextAuth secret is required in production (see src/lib/auth.ts)
