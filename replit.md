# School Hub

A student-built notes library for Class 11/12 students — browse and submit notes, practicals, and resources. Includes an admin panel for reviewing and approving submissions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secret: `ADMIN_PASSWORD` — password for admin panel at `/admin/login`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Wouter (routing)
- API: Express 5 + cookie-parser + multer (file uploads)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/school-hub/` — React/Vite frontend (previewPath `/`)
- `artifacts/api-server/` — Express API backend (port 8080)
- `lib/db/src/schema/submissions.ts` — Drizzle schema (source of truth for DB)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `artifacts/school-hub/src/data/practicals.ts` — hardcoded practicals data
- `artifacts/api-server/uploads/` — uploaded files (runtime, not committed)
- `artifacts/api-server/public-uploads/` — backup/seed PDFs

## Architecture decisions

- File uploads use multer; files stored on disk in `artifacts/api-server/uploads/` and served at `/api/uploads/`
- Admin auth is cookie-based (`admin-auth=true`, `admin-name`); password checked against `ADMIN_PASSWORD` env secret
- Practicals are hardcoded in `data/practicals.ts` (static data); notes/resources come from the DB
- OpenAPI spec omits the binary `file` field to avoid Zod codegen errors — file uploads use raw `FormData` bypassing the generated client
- `BASE_URL` from `import.meta.env.BASE_URL` is used as the wouter base to support path-based routing in the Replit proxy

## Product

- **Home** — hero, stats (approved files, contributors, subjects, pending), latest uploads, subjects grid
- **Notes** — filterable grid of approved note PDFs (search, subject, author filters)
- **Practicals** — hardcoded CS practicals with code, output, algorithm, and viva Q&A
- **Resources** — filterable grid of approved resource PDFs
- **Submit** — form to upload a PDF/file for admin review
- **Admin** — `/admin/login` + `/admin/submissions` to approve/reject pending submissions

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Codegen must exclude binary fields (File/Blob) — define file upload routes to accept `multipart/form-data` but don't put `file` in the OpenAPI schema
- Run `pnpm --filter @workspace/db run push` after any schema changes before starting the API server
- Cookie `sameSite: strict` + `credentials: "include"` required for admin auth to work in the Replit proxy

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
