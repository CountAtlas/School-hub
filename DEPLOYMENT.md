# Deployment Guide

School Hub is a two-service app:

| Service | Platform | What it does |
|---------|----------|--------------|
| **Frontend** | Vercel | React + Vite SPA |
| **API Server** | Railway or Render | Express 5 + PostgreSQL |

---

## 1 — Database (Supabase or Railway Postgres)

1. Create a Supabase project at [supabase.com](https://supabase.com) (free tier works).
2. Copy the **Connection string** from *Project Settings → Database → Connection string (URI)*.
3. Use this as `DATABASE_URL` in the API server env vars.

### Apply the schema

Run once from your local machine (with `DATABASE_URL` pointing to the production DB):

```bash
pnpm --filter @workspace/db run push
```

---

## 2 — Supabase Storage (for file uploads)

1. In your Supabase project go to **Storage** and create a bucket named `submissions`.
2. Set the bucket to **Public** (so uploaded PDFs can be served without a signed URL).
3. Copy the **Project URL** and **service_role key** from *Project Settings → API*.
4. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the API server env vars.

> Without these env vars the API falls back to storing files on disk — fine for local dev but files are lost on Railway/Render redeploy. Always configure Supabase Storage in production.

---

## 3 — API Server on Railway

1. Connect your GitHub repo to a new Railway project.
2. Set the **root directory** to `artifacts/api-server`.
3. Set **build command**: `pnpm install && node ./build.mjs`
4. Set **start command**: `node --enable-source-maps ./dist/index.mjs`
5. Add env vars:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase / Railway Postgres connection string |
| `SESSION_SECRET` | Random 32-char secret (`openssl rand -base64 32`) |
| `ADMIN_PASSWORD` | Initial admin password (used once to seed DB) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ALLOWED_ORIGIN` | Your Vercel frontend URL (e.g. `https://school-hub.vercel.app`) |
| `PORT` | Leave blank — Railway sets this automatically |
| `NODE_ENV` | `production` |

6. Deploy and note the Railway public URL (e.g. `https://school-hub-api.up.railway.app`).

---

## 4 — Frontend on Vercel

1. Import your GitHub repo into a new Vercel project.
2. Set the **root directory** to `artifacts/school-hub`.
3. Vercel will detect Vite automatically. Override if needed:
   - **Build Command**: `cd ../.. && pnpm --filter @workspace/school-hub run build`
   - **Output Directory**: `dist/public`
4. Add env vars:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway API URL (e.g. `https://school-hub-api.up.railway.app`) |

> **No** `PORT` or `BASE_PATH` needed for Vercel — these are Replit-specific.

5. Deploy. The SPA routing is handled by `vercel.json` (already committed).

---

## Migrating existing uploads

If you have files already stored on the Replit disk, upload them to the Supabase `submissions/uploads/` path manually using the Supabase dashboard or the CLI.

---

## Local development

Everything still works in Replit without Supabase:
- Files are stored in `artifacts/api-server/uploads/` on disk.
- `VITE_API_URL` is not set — frontend uses relative `/api/` paths.
- `DATABASE_URL` points to the Replit-managed Postgres.
