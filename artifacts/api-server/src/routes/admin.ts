import { Router } from "express";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function isAdmin(req: any): boolean {
  return req.cookies?.["admin-auth"] === "true";
}

// POST /api/admin/login
router.post("/admin/login", async (req, res) => {
  const { password, name } = req.body;
  const adminName = String(name || "").trim().slice(0, 40) || "Admin";

  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: "ADMIN_PASSWORD is not configured." });
    return;
  }

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  };

  res.cookie("admin-auth", "true", cookieOptions);
  res.cookie("admin-name", adminName, cookieOptions);
  res.json({ ok: true, name: adminName });
});

// POST /api/admin/logout
router.post("/admin/logout", (_req, res) => {
  const clear = { httpOnly: true, path: "/", maxAge: 0 };
  res.clearCookie("admin-auth", clear);
  res.clearCookie("admin-name", clear);
  res.json({ ok: true });
});

// GET /api/admin/me
router.get("/admin/me", (req, res) => {
  const authenticated = isAdmin(req);
  const name = req.cookies?.["admin-name"] || null;
  res.json({ authenticated, name });
});

export default router;
