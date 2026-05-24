# Security issues and remediation

Track record of known risks and how this repo addresses them. Re-run `npm audit` in the project root and `server/` after dependency updates.

| # | Issue | Severity | Status |
|---|--------|----------|--------|
| 1 | `server/.env` not gitignored | Critical | **Fixed** — `.env` patterns in `.gitignore` |
| 2 | No rate limiting on auth | Critical | **Fixed** — `@fastify/rate-limit` on auth/admin routes |
| 3 | Privileges ignore `approved` status | Critical | **Fixed** — `userHasPrivilege` requires approved user |
| 4 | No server-side privilege helper for future APIs | High | **Fixed** — `requireApprovedPrivilege` middleware |
| 5 | Admin password re-hashed every admin login | High | **Fixed** — only set hash on admin account create |
| 6 | Reset token in URL query (logs/referrer) | High | **Fixed** — email link uses `#token=` fragment |
| 7 | Reset validation via GET | High | **Fixed** — `POST /auth/reset-password/validate` |
| 8 | No CSRF / origin checks on mutations | High | **Fixed** — `verifyRequestOrigin` on POST/PATCH/PUT |
| 9 | Sessions not rotated on login | High | **Fixed** — all sessions cleared before new session |
| 10 | API listens on `0.0.0.0` in dev | Medium | **Fixed** — `API_HOST=127.0.0.1` default in development |
| 11 | OAuth state in memory only | Medium | **Fixed** — `oauth_states` table |
| 12 | No security headers | Medium | **Fixed** — `@fastify/helmet` + Netlify/Vercel headers |
| 13 | Unsigned session cookie | Medium | **Fixed** — cookie plugin uses `SESSION_SECRET` |
| 14 | Direct grant of `admin:manage_users` | Medium | **Fixed** — blocked in `setUserPrivileges` (role only) |
| 15 | Registration reveals admin email | Medium | **Fixed** — generic registration errors |
| 16 | Registration email/username enumeration | Low | **Mitigated** — generic duplicate messages |
| 17 | Unbounded sessions per user | Low | **Fixed** — max 10 sessions per user |
| 18 | No admin audit log | Low | **Fixed** — `admin_audit_log` table |
| 19 | `toPublicUser` leaked privileges when pending | Medium | **Fixed** — strips privileges/`isAdmin` if not approved |
| 20 | `attachCurrentUser` used raw `process.env` | Low | **Fixed** — uses loaded `Env` |
| 21 | Open registration / no CAPTCHA | Info | **Open** — add Turnstile/hCaptcha when deploying publicly |
| 22 | Admin password in env (plaintext at rest) | Info | **Open** — use secrets manager in production; rotate often |
| 23 | No email verification on register | Info | **Open** — future enhancement |
| 24 | 14-day session TTL | Info | **Accepted** — adjust `SESSION_TTL_MS` if needed |

## Incident: `server/.env` was committed

See **`docs/SECRET-ROTATION.md`** for rotation and Git history cleanup. Local credentials were rotated; purge GitHub history with `git filter-repo` before considering the leak fully closed.

## Operations

```bash
# Apply new DB migration after pull
npm run db:migrate

# Audit dependencies
npm audit
cd server && npm audit
```

## Production checklist

- [ ] Strong `SESSION_SECRET` (32+ random bytes)
- [ ] `NODE_ENV=production`, `API_HOST=0.0.0.0` only behind reverse proxy with HTTPS
- [ ] `CLIENT_URL` matches deployed frontend exactly
- [ ] Never commit `server/.env`
- [ ] Rotate `ADMIN_LOGIN_PASSWORD` if it was ever exposed
- [ ] Lock OAuth redirect URIs in Google/Meta consoles
- [ ] Consider CAPTCHA on register (issue #21)
