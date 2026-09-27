# FMCG Retail Dashboard (frontend)

Next.js client-side dashboard for the FMCG retail dataset. Fetches all data via
Axios from the FastAPI backend in [`../backend`](../backend) — see the repo
root for the full architecture (SQLite → FastAPI → Next.js).

## Local development

```bash
npm install
npm run dev
```

Requires `NEXT_PUBLIC_API_URL` pointing at a running backend (defaults to
`http://localhost:8000` if unset — see `src/lib/api.ts`). For local dev, copy:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

into `.env.local` (gitignored, not committed).

## Deploying on AWS Amplify

This app lives in a subdirectory of the repo (`fmcg-dashboard/`), not the
repo root, so Amplify needs the monorepo build spec at
[`../amplify.yml`](../amplify.yml) — Amplify Hosting picks this up
automatically when you connect the repo.

Steps in the Amplify Console:

1. **Host web app → GitHub → select this repo and branch.** Amplify should
   detect `amplify.yml` at the repo root and the `fmcg-dashboard` app root
   from it.
2. **App settings → Environment variables** — add:
   - `NEXT_PUBLIC_API_URL` = the public URL of your deployed FastAPI backend

   Amplify Hosting only serves this Next.js frontend — it does not run the
   Python backend in `../backend`. That needs to be deployed separately
   (e.g. AWS App Runner, ECS, EC2) and be publicly reachable, with CORS in
   `backend/app/main.py` updated to allow your Amplify domain, before the
   deployed dashboard will show live data.
3. Deploy. Subsequent pushes to the connected branch redeploy automatically.
