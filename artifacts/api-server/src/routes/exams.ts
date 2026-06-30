import { Router } from "express";
import { randomUUID } from "crypto";
import { db, examsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isAdmin } from "./admin";

const router = Router();

function examToApi(e: any) {
  return {
    id: e.id,
    subject: e.subject,
    date: e.date,
    portion: e.portion ?? null,
    board: e.board ?? null,
    classLevel: e.classLevel ?? null,
    stream: e.stream ?? null,
    postedBy: e.postedBy,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
  };
}

// GET /api/exams
router.get("/exams", async (req, res) => {
  const classLevel = req.query.classLevel as string | undefined;
  const board = req.query.board as string | undefined;
  const subject = req.query.subject as string | undefined;

  let rows = await db.select().from(examsTable);

  // Filter out past exams (keep today onwards)
  const today = new Date().toISOString().slice(0, 10);
  rows = rows.filter((r) => r.date >= today);

  if (classLevel) rows = rows.filter((r) => r.classLevel === classLevel);
  if (board) rows = rows.filter((r) => r.board === board);
  if (subject) rows = rows.filter((r) => r.subject === subject);

  // Sort by date ascending (closest first)
  rows.sort((a, b) => a.date.localeCompare(b.date));

  res.json({ exams: rows.map(examToApi) });
});

// POST /api/exams
router.post("/exams", async (req, res) => {
  const { subject, date, portion, board, classLevel, stream, postedBy } = req.body;

  if (!subject?.trim() || !date?.trim() || !postedBy?.trim()) {
    res.status(400).json({ error: "subject, date, and postedBy are required." });
    return;
  }

  const id = randomUUID();
  await db.insert(examsTable).values({
    id,
    subject: subject.trim(),
    date: date.trim(),
    portion: portion?.trim() || null,
    board: board?.trim() || null,
    classLevel: classLevel?.trim() || null,
    stream: stream?.trim() || null,
    postedBy: postedBy.trim(),
    createdAt: new Date(),
  });

  const rows = await db.select().from(examsTable).where(eq(examsTable.id, id));
  res.json({ ok: true, exam: examToApi(rows[0]) });
});

// DELETE /api/exams (admin only)
router.delete("/exams", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Admin authentication required." });
    return;
  }
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "id is required." });
    return;
  }
  await db.delete(examsTable).where(eq(examsTable.id, id));
  res.json({ ok: true });
});

export default router;
