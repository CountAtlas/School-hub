import { Router } from "express";
import { randomUUID } from "crypto";
import { db, dailyUpdatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function toTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateToApi(u: any) {
  let verifications: string[] = [];
  try {
    verifications = JSON.parse(u.verifications ?? "[]");
  } catch {}
  return {
    id: u.id,
    date: u.date,
    subject: u.subject,
    teacher: u.teacher ?? null,
    classLevel: u.classLevel ?? null,
    board: u.board ?? null,
    portionCovered: u.portionCovered ?? null,
    homework: u.homework ?? null,
    practicalWork: u.practicalWork ?? null,
    announcement: u.announcement ?? null,
    postedBy: u.postedBy,
    verifications,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
  };
}

// GET /api/daily-updates
router.get("/daily-updates", async (req, res) => {
  const date = (req.query.date as string) || toTodayDate();
  const subject = req.query.subject as string | undefined;
  const classLevel = req.query.classLevel as string | undefined;
  const board = req.query.board as string | undefined;

  let rows = await db.select().from(dailyUpdatesTable).where(eq(dailyUpdatesTable.date, date));

  if (subject) rows = rows.filter((r) => r.subject === subject);
  if (classLevel) rows = rows.filter((r) => r.classLevel === classLevel);
  if (board) rows = rows.filter((r) => r.board === board);

  rows.sort((a, b) => {
    const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
    const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
    return tb - ta;
  });

  res.json({ updates: rows.map(updateToApi) });
});

// POST /api/daily-updates
router.post("/daily-updates", async (req, res) => {
  const { subject, postedBy, date, teacher, classLevel, board, portionCovered, homework, practicalWork, announcement } = req.body;

  if (!subject?.trim() || !postedBy?.trim()) {
    res.status(400).json({ error: "subject and postedBy are required." });
    return;
  }

  const id = randomUUID();
  const now = new Date();
  await db.insert(dailyUpdatesTable).values({
    id,
    date: date || toTodayDate(),
    subject: subject.trim(),
    teacher: teacher?.trim() || null,
    classLevel: classLevel?.trim() || null,
    board: board?.trim() || null,
    portionCovered: portionCovered?.trim() || null,
    homework: homework?.trim() || null,
    practicalWork: practicalWork?.trim() || null,
    announcement: announcement?.trim() || null,
    postedBy: postedBy.trim(),
    verifications: "[]",
    createdAt: now,
    updatedAt: now,
  });

  const rows = await db.select().from(dailyUpdatesTable).where(eq(dailyUpdatesTable.id, id));
  res.json({ ok: true, update: updateToApi(rows[0]) });
});

// POST /api/daily-updates/:id/verify
router.post("/daily-updates/:id/verify", async (req, res) => {
  const { id } = req.params;
  const { studentName } = req.body;

  if (!studentName?.trim()) {
    res.status(400).json({ error: "studentName is required." });
    return;
  }

  const rows = await db.select().from(dailyUpdatesTable).where(eq(dailyUpdatesTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Update not found." });
    return;
  }

  let verifications: string[] = [];
  try {
    verifications = JSON.parse(rows[0].verifications ?? "[]");
  } catch {}

  const name = studentName.trim();
  if (verifications.includes(name)) {
    res.status(400).json({ error: "Already verified by this student." });
    return;
  }

  verifications.push(name);
  await db
    .update(dailyUpdatesTable)
    .set({ verifications: JSON.stringify(verifications), updatedAt: new Date() })
    .where(eq(dailyUpdatesTable.id, id));

  const updated = await db.select().from(dailyUpdatesTable).where(eq(dailyUpdatesTable.id, id));
  res.json({ ok: true, update: updateToApi(updated[0]) });
});

export default router;
