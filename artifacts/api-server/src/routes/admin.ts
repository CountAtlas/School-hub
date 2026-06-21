import { Router } from "express";
import { createHash, randomUUID } from "crypto";
import type { Request } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function isAdmin(req: Request): boolean {
  return (req.session as any)?.adminAuthenticated === true;
}

export async function initAdmins(): Promise<void> {
  const existing = await db.select().from(adminsTable).limit(1);
  if (existing.length > 0) return;

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    console.warn("[admin] No ADMIN_PASSWORD set and no admins in DB — admin login will be unavailable.");
    return;
  }

  await db.insert(adminsTable).values({
    id: randomUUID(),
    name: "Admin",
    passwordHash: hashPassword(ADMIN_PASSWORD),
  });
  console.info("[admin] Seeded default admin account from ADMIN_PASSWORD.");
}

// POST /api/admin/login
router.post("/admin/login", async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(400).json({ error: "Name and password are required." });
    return;
  }

  const rows = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.name, String(name).trim()));

  if (rows.length === 0 || rows[0].passwordHash !== hashPassword(String(password))) {
    res.status(401).json({ error: "Invalid name or password." });
    return;
  }

  (req.session as any).adminAuthenticated = true;
  (req.session as any).adminName = rows[0].name;
  (req.session as any).adminId = rows[0].id;

  req.session.save((err) => {
    if (err) {
      res.status(500).json({ error: "Session error." });
      return;
    }
    res.json({ ok: true, name: rows[0].name });
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

// GET /api/admin/users — list all admin accounts (admin only)
router.get("/admin/users", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db.select({
    id: adminsTable.id,
    name: adminsTable.name,
    createdAt: adminsTable.createdAt,
  }).from(adminsTable).orderBy(adminsTable.createdAt);
  res.json({ admins: rows.map((r) => ({ ...r, createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt })) });
});

// POST /api/admin/users — create a new admin account (admin only)
router.post("/admin/users", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(400).json({ error: "Name and password are required." });
    return;
  }
  if (String(password).length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }

  const trimmedName = String(name).trim().slice(0, 40);
  const existing = await db.select().from(adminsTable).where(eq(adminsTable.name, trimmedName));
  if (existing.length > 0) {
    res.status(409).json({ error: "An admin with that name already exists." });
    return;
  }

  const id = randomUUID();
  await db.insert(adminsTable).values({ id, name: trimmedName, passwordHash: hashPassword(String(password)) });
  res.json({ ok: true, admin: { id, name: trimmedName } });
});

// DELETE /api/admin/users/:id — delete an admin account (admin only, can't delete self)
router.delete("/admin/users/:id", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const currentId = (req.session as any)?.adminId;

  if (id === currentId) {
    res.status(400).json({ error: "You cannot delete your own account." });
    return;
  }

  const all = await db.select().from(adminsTable);
  if (all.length <= 1) {
    res.status(400).json({ error: "Cannot delete the last admin account." });
    return;
  }

  await db.delete(adminsTable).where(eq(adminsTable.id, id));
  res.json({ ok: true });
});

export default router;
