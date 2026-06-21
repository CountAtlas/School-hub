import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

// Cross-origin deployment (Vercel frontend + Railway API): ALLOWED_ORIGIN is set.
// Same-origin / Replit dev: ALLOWED_ORIGIN is unset.
const allowedOrigin = process.env.ALLOWED_ORIGIN;
const isCrossOrigin = Boolean(allowedOrigin);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({
  origin: allowedOrigin
    ? allowedOrigin.split(",").map((o) => o.trim())
    : true,
  credentials: true,
  exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    name: "sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Cross-origin (Vercel ↔ Railway): SameSite=None requires Secure=true.
      // Same-origin / local dev: SameSite=Strict is stricter and fine.
      secure: isCrossOrigin || process.env.NODE_ENV === "production",
      sameSite: isCrossOrigin ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const BACKUP_UPLOADS = path.join(process.cwd(), "public-uploads");

function safeStaticMiddleware(dir: string) {
  return express.static(dir, {
    setHeaders(res) {
      res.setHeader("Content-Disposition", "attachment");
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  });
}

// Only serve files from disk when Supabase Storage is not configured.
// In production (SUPABASE_URL set), files are served directly from Supabase CDN URLs.
if (!process.env.SUPABASE_URL) {
  app.use("/api/uploads", safeStaticMiddleware(UPLOAD_DIR));
  app.use("/api/uploads", safeStaticMiddleware(BACKUP_UPLOADS));
}

app.use("/api", router);

export default app;
