---
name: pdfjs-dist setup in Vite/Replit
description: How to configure pdfjs-dist to work correctly in the Replit Vite dev environment
---

# pdfjs-dist setup for Replit + Vite

## Rule
Use **pdfjs-dist v3.11.174** with the worker file copied to `public/`.

```
# Install
pnpm add pdfjs-dist@3.11.174

# Copy worker to public/ (must be re-done if pdfjs is reinstalled)
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/pdf.worker.min.js
```

Component setup:
```ts
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc =
  import.meta.env.BASE_URL + "pdf.worker.min.js";

// In render:
const loadingTask = pdfjs.getDocument({ url, withCredentials: true });
```

**Why:**
- v4.x and v6.x use `Map.prototype.getOrInsertComputed` which is only in Chrome 136+. The Replit screenshot tool and some browsers don't have it yet. v3.11.174 is fully stable.
- CDN worker URLs are blocked in the Replit sandbox environment.
- Vite can't resolve `pdfjs-dist/build/pdf.worker.min.js?url` for v3 (CJS package, no exports map) — must use a static public asset instead.
- `fetch()` + `arrayBuffer()` approach fails silently when the server returns HTTP 304 (no body) — always pass `{ url }` directly to `getDocument` and let pdfjs handle caching.
- `workerPort = new Worker(...)` is wrong — `workerPort` expects a `MessagePort`, not a `Worker`.

**How to apply:**
Any time pdfjs-dist is needed in the school-hub Vite app, use this exact setup. If pdfjs-dist is reinstalled or updated, re-copy the worker file to public/.
