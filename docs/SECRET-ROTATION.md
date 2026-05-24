# Secret rotation (after `server/.env` was committed)

`server/.env` was accidentally committed to GitHub. Remediation steps:

## Already done locally

1. `server/.env` removed from Git tracking (file stays on disk, listed in `.gitignore`).
2. New `SESSION_SECRET` and `ADMIN_LOGIN_PASSWORD` generated in your local `server/.env` only.
3. Security hardening and `docs/SECURITY.md` added.

## You must do on GitHub

### 1. Push the fix commit

After pulling latest, push so `server/.env` is no longer in the **latest** tree.

### 2. Purge history (recommended)

Old commits still contain the leaked file until history is rewritten.

**Option A — `git filter-repo` (recommended)**

```bash
# Install once: brew install git-filter-repo
git filter-repo --path server/.env --invert-paths --force
git remote add origin https://github.com/aleksandrkayner/portfolioV3.git
git push origin main --force
```

**Option B — GitHub support**

If the repo is public, use GitHub **Secret scanning** alerts and consider making the repo private until history is cleaned.

### 3. Treat old credentials as compromised

- Do **not** reuse `Admin123!` or the old `SESSION_SECRET` anywhere.
- Use the new admin password from your local `server/.env` (or set your own and restart the API).

### 4. Restart API after rotation

```bash
npm run dev:server
```

All users must sign in again (new session secret + signed cookies).

## Never commit

- `server/.env`
- `.env` (root), unless you add real secrets there

Safe to commit: `server/.env.example`, `.env.example` (placeholders only).
