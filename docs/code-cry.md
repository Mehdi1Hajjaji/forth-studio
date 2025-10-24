Code & Cry — Live Co‑Coding Sessions
====================================

Overview
- Live, unfiltered coding streams with optional anonymity, chat, and “ask for help”.
- Built with Next.js App Router, Prisma/Postgres, NextAuth, and LiveKit for video.

Key Pieces
- Database models: `CodeCrySession`, `ChatMessage`, `HelpRequest` (see `schema.prisma`).
- API routes under `src/app/api/code-cry/...`:
  - `GET /api/code-cry/sessions` — list sessions (filters: `status=upcoming|live|past`).
  - `POST /api/code-cry/session` — create a session (auth).
  - `POST /api/code-cry/session/[id]/start` — start session (host only).
  - `GET /api/code-cry/session/[id]/messages` — list chat messages.
  - `POST /api/code-cry/session/[id]/chat` — post message (auth; supports anonymous flag).
  - `POST /api/code-cry/session/[id]/help-request` — raise hand (auth; supports anonymous flag).
  - `POST /api/code-cry/session/[id]/token` — request LiveKit token (host can publish; others subscribe).
  - `POST /api/code-cry/session/[id]/messages/[messageId]/vote` — upvote chat message (idempotent per user).
  - `POST|DELETE /api/code-cry/session/[id]/moderation/mute` — mute/unmute a user (host-only).
  - `POST|DELETE /api/code-cry/session/[id]/moderation/ban` — ban/unban a user (host-only).
  - `POST /api/code-cry/session/[id]/moderation/settings` — toggles for `isChatClosed`, `isViewOnly`, `isStuck` (host-only).
  - `GET|POST /api/code-cry/session/[id]/code` — fetch/update shared code content (host-only for updates).
  - `GET /api/code-cry/session/[id]/events/chat` — SSE for live chat.
  - `GET /api/code-cry/session/[id]/events/code` — SSE for live code updates.

Frontend
- Main page: `src/app/code-cry/page.tsx` — shows live, upcoming, and recent sessions.
- Session room: `src/app/code-cry/session/[id]/page.tsx` with client components:
  - `room-client.tsx` — joins LiveKit room via token; renders `VideoConference`.
  - `sidebar.tsx` — SSE chat with upvotes and an “Ask for help” modal.
  - `CodePanel.tsx` — Monaco-based read-only code preview; host can publish updates.

LiveKit Setup
1) Add to `.env`:
   - `LIVEKIT_URL=https://your-livekit.example.com`
   - `LIVEKIT_API_KEY=...`
   - `LIVEKIT_API_SECRET=...`
2) Install deps: `npm i @livekit/components-react livekit-client livekit-server-sdk`.

Migrations
- After updating environment, run `npm run db:migrate` to apply new Prisma models.
  - If you see a drift warning, do NOT reset prod/staging DBs. Instead, apply prior migrations first, or use `prisma migrate deploy` if migrations exist. For brand new DBs you can use `prisma migrate dev --name init`.

Future Enhancements
- Replace chat polling with WebSocket/SSE.
- Add WebSocket transport for chat (SSE is shipped in MVP and can be upgraded).
- Expand moderation UI (list muted/banned, quick actions) and session recording hooks.
- Presenter UI: explicit screen-share toggle UI, “I’m stuck” highlight, host controls.
