import { Router } from "express";
import { randomUUID } from "crypto";
import { db, announcementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

const router = Router();

const ALLOWED_TYPES = ["holiday", "schedule-change", "practical-reminder", "event", "other"];

function announcementToApi(a: any) {
  return {
    id: a.id,
    title: a.title,
    content: a.content,
    type: a.type,
    postedBy: a.postedBy,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  };
}

// GET /api/announcements
router.get("/announcements", async (req, res) => {
  const limit = parseInt((req.query.limit as string) || "20", 10);
  const rows = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.createdAt))
    .limit(limit);
  res.json({ announcements: rows.map(announcementToApi) });
});

// POST /api/announcements
router.post("/announcements", async (req, res) => {
  const { title, content, type, postedBy } = req.body;

  if (!title?.trim() || !content?.trim() || !postedBy?.trim()) {
    res.status(400).json({ error: "title, content, and postedBy are required." });
    return;
  }

  const normalizedType = ALLOWED_TYPES.includes(type) ? type : "other";
  const id = randomUUID();

  await db.insert(announcementsTable).values({
    id,
    title: title.trim(),
    content: content.trim(),
    type: normalizedType,
    postedBy: postedBy.trim(),
    createdAt: new Date(),
  });

  const rows = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
  res.json({ ok: true, announcement: announcementToApi(rows[0]) });
});

export default router;
