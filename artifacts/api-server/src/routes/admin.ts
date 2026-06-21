import { Router } from "express";
import type { Request } from "express";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export function isAdmin(req: Request): boolean {
  return (req.session as any)?.adminAuthenticated === true;
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

  (req.session as any).adminAuthenticated = true;
  (req.session as any).adminName = adminName;

  req.session.save((err) => {
    if (err) {
      res.status(500).json({ error: "Session error." });
      return;
    }
    res.json({ ok: true, name: adminName });
  });
});

// POST /api/admin/logout
router.post("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout error." });
      return;
    }
    res.clearCookie("sid");
    res.json({ ok: true });
  });
});

// GET /api/admin/me
router.get("/admin/me", (req, res) => {
  const authenticated = isAdmin(req);
  const name = (req.session as any)?.adminName || null;
  res.json({ authenticated, name });
});

export default router;
