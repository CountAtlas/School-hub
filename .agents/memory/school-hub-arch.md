---
name: School Hub architecture
description: Key non-obvious decisions from the School Hub Vercel→Replit migration — uploads, admin auth, codegen, routing.
---

## File upload codegen quirk
OpenAPI spec must NOT include a binary `file` field — Orval/Zod codegen fails on File/Blob types. File upload routes accept `multipart/form-data` but the file field is omitted from the spec. Frontend uses raw `FormData` + `fetch` directly, bypassing the generated client.

**Why:** Orval generates Zod schemas from OpenAPI; `type: string, format: binary` produces `z.instanceof(File)` which errors in Node/server contexts.

**How to apply:** Any new file-upload endpoint: keep the OpenAPI schema to non-binary fields only; handle uploads with multer in Express; use raw fetch on the frontend.

## Admin auth pattern
Cookie-based auth: `admin-auth=true` + `admin-name` cookies set on login, checked in middleware. Password compared against `ADMIN_PASSWORD` env secret. Cookies use `sameSite: strict`; frontend must pass `credentials: "include"` on every fetch.

**Why:** Simple, no JWT library needed; works well with Express + cookie-parser.

## Practicals are static data
`artifacts/school-hub/src/data/practicals.ts` holds hardcoded practical programs. Not in the DB. The DB only stores submitted notes/resources/practicals PDFs.

## Wouter base routing
`<WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>` — strips trailing slash so wouter routes match correctly under the Replit proxy path prefix.

**Why:** Replit uses path-based routing; BASE_URL includes a trailing slash that wouter doesn't expect.
