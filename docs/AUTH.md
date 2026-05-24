# Authentication

## Stack

- **API:** Fastify (Node) in `server/`
- **Database:** PostgreSQL (users, sessions, OAuth accounts, roles, privileges)
- **Sessions:** httpOnly cookies (14-day TTL)
- **Passwords:** Argon2 with server-side validation
- **OAuth:** Google and Facebook (optional via env vars)

## Local setup

```bash
# 1. Start Postgres
npm run db:up

# 2. Configure API
cp server/.env.example server/.env
# Edit ADMIN_EMAIL and SESSION_SECRET

# 3. Install & migrate
cd server && npm install
npm run db:migrate
npm run db:seed

# 4. Run API (terminal 1)
npm run dev:server

# 5. Run frontend (terminal 2)
npm run dev
```

Frontend proxies `/api` → `http://localhost:3001`.

## Troubleshooting

**502 on login or admin** — the API is not running. In the API terminal you should see `API listening on http://localhost:3001`. If you see `Invalid environment variables` for `ADMIN_LOGIN_EMAIL` / `ADMIN_LOGIN_PASSWORD`, add them to `server/.env` and restart:

```bash
npm run dev:server
```

Quick check: open http://localhost:3001/api/health — should return `{"ok":true}`.

## User flow

1. Anyone can **register** (username/email/password) or use **Google/Facebook**.
2. New accounts start as **`pending`** — they can sign in but member content stays hidden.
3. **Admin** — sign in at `/admin/login` with `ADMIN_LOGIN_EMAIL` + `ADMIN_LOGIN_PASSWORD` from `server/.env`, then open `/admin`.
4. Approved users with privileges (e.g. `view:member_content`) see member-only UI.

## Admin sign-in

Set in `server/.env` (never commit production values):

```env
ADMIN_LOGIN_EMAIL=admin@yourdomain.com
ADMIN_LOGIN_PASSWORD=YourSecurePass1!
```

- Sign in at **`/admin/login`** with those credentials only.
- Admin access is **not** granted via normal registration or OAuth.
- `ADMIN_EMAIL` is only for registration notification emails.
- On first admin login, the account is created (or upgraded) with the `admin` role.

Register these in Google Cloud / Meta developer console:

- `http://localhost:5173/api/auth/google/callback`
- `http://localhost:5173/api/auth/facebook/callback`

Production: replace host with your deployed frontend URL (Vite proxy or same-origin `/api`).

## Password reset

1. User opens `/forgot-password` and submits email.
2. API emails a one-hour reset link (logged to console in dev).
3. User sets a new password at `/reset-password#token=...` (token in URL hash, not sent to servers).
4. All existing sessions for that user are invalidated.

OAuth-only accounts (no password) do not receive reset emails — same generic success message either way.

- 8–128 characters
- At least one uppercase, lowercase, number, and special character

## Username rules

- 3–32 characters
- Letters, numbers, underscores only

## Admin entitlements

Default privileges (seeded):

| Key | Purpose |
|-----|---------|
| `view:member_content` | Member-only dashboard content |
| `view:beta_features` | Beta features |
| `admin:manage_users` | Access `/admin` |

Assign per user in the admin screen, or via the `member` / `admin` roles.
