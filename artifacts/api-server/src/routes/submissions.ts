import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { db, submissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "./admin";
import { uploadFile } from "../lib/storage";

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-python-code",
  "text/x-python",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".txt",
  ".py",
  ".zip",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = file.originalname.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
    cb(null, `${base}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

function submissionToApi(s: any) {
  return {
    id: s.id,
    title: s.title,
    subject: s.subject,
    board: s.board ?? null,
    classLevel: s.classLevel,
    section: s.section,
    author: s.author ?? null,
    description: s.description ?? null,
    originalFileName: s.originalFileName ?? "",
    storedFileName: s.storedFileName ?? "",
    fileUrl: s.fileUrl ?? "",
    mimeType: s.mimeType ?? "",
    status: s.status,
    views: s.views ?? 0,
    downloads: s.downloads ?? 0,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
    approvedBy: s.approvedBy ?? null,
    approvedAt: s.approvedAt ?? null,
    rejectedBy: s.rejectedBy ?? null,
    rejectedAt: s.rejectedAt ?? null,
    practicalNo: s.practicalNo ?? null,
    aim: s.aim ?? null,
    algorithm: s.algorithm ?? null,
    code: s.code ?? null,
    expectedOutput: s.expectedOutput ?? null,
    commonErrors: s.commonErrors ?? null,
    vivaQA: s.vivaQA ?? null,
    tags: s.tags ?? null,
  };
}

// GET /api/submissions — admin only, all submissions
router.get("/submissions", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db.select().from(submissionsTable).orderBy(submissionsTable.createdAt);
  res.json({ submissions: rows.map(submissionToApi).reverse() });
});

// GET /api/submissions/approved — public, approved by optional section
router.get("/submissions/approved", async (req, res) => {
  const section = req.query.section as string | undefined;
  let rows;
  if (section) {
    rows = await db
      .select()
      .from(submissionsTable)
      .where(and(eq(submissionsTable.status, "approved"), eq(submissionsTable.section, section)));
  } else {
    rows = await db.select().from(submissionsTable).where(eq(submissionsTable.status, "approved"));
  }
  res.json({ submissions: rows.map(submissionToApi) });
});

// GET /api/submissions/stats — public stats
router.get("/submissions/stats", async (req, res) => {
  const all = await db.select().from(submissionsTable);
  const approved = all.filter((s) => s.status === "approved");
  const pending = all.filter((s) => s.status === "pending");
  const notes = approved.filter((s) => s.section === "notes");
  const practicals = approved.filter((s) => s.section === "practicals");
  const resources = approved.filter((s) => s.section === "resources");
  const contributors = new Set(approved.map((s) => s.author?.trim()).filter(Boolean)).size;
  const subjects = new Set(approved.map((s) => s.subject?.trim()).filter(Boolean)).size;
  res.json({
    approvedCount: approved.length,
    pendingCount: pending.length,
    notesCount: notes.length,
    practicalsCount: practicals.length,
    resourcesCount: resources.length,
    contributors,
    subjectsCount: subjects,
  });
});

// GET /api/submissions/:id — public, single submission by ID
router.get("/submissions/:id", async (req, res) => {
  const { id } = req.params;
  // Don't handle sub-paths here
  if (id === "approved" || id === "stats") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const rows = await db.select().from(submissionsTable).where(eq(submissionsTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ submission: submissionToApi(rows[0]) });
});

// POST /api/submissions — public, create submission with optional file upload
router.post("/submissions", upload.single("file"), async (req, res) => {
  const {
    title, subject, classLevel, section, board, author, description,
    practicalNo, aim, algorithm, code, expectedOutput, commonErrors, vivaQA, tags,
  } = req.body;
  const file = req.file;

  if (!title || !subject || !classLevel || !section) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  // File is required for notes and resources, optional for practicals
  if (section !== "practicals" && !file) {
    res.status(400).json({ error: "A file is required for notes and resources." });
    return;
  }

  const allowedClassLevels = ["11", "12"];
  const allowedSections = ["notes", "practicals", "resources"];
  const allowedBoards = ["CBSE", "ISC"];
  const normalizedBoard = (board || "CBSE").toUpperCase();

  if (!allowedClassLevels.includes(classLevel)) {
    res.status(400).json({ error: "Invalid class level." });
    return;
  }
  if (!allowedSections.includes(section)) {
    res.status(400).json({ error: "Invalid section." });
    return;
  }
  if (!allowedBoards.includes(normalizedBoard)) {
    res.status(400).json({ error: "Invalid board." });
    return;
  }

  const id = randomUUID();
  const fileUrl = file
    ? await uploadFile(file.path, file.filename, file.mimetype)
    : "";

  await db.insert(submissionsTable).values({
    id,
    title: title.trim(),
    subject: subject.trim(),
    board: normalizedBoard,
    classLevel,
    section,
    author: author?.trim() || null,
    description: description?.trim() || null,
    originalFileName: file?.originalname ?? "",
    storedFileName: file?.filename ?? "",
    fileUrl,
    mimeType: file?.mimetype ?? "text/plain",
    status: "pending",
    practicalNo: practicalNo?.trim() || null,
    aim: aim?.trim() || null,
    algorithm: algorithm?.trim() || null,
    code: code?.trim() || null,
    expectedOutput: expectedOutput?.trim() || null,
    commonErrors: commonErrors?.trim() || null,
    vivaQA: vivaQA?.trim() || null,
    tags: tags?.trim() || null,
  });

  const rows = await db.select().from(submissionsTable).where(eq(submissionsTable.id, id));
  res.json({ ok: true, submission: submissionToApi(rows[0]) });
});

// PATCH /api/submissions — admin, update status
router.patch("/submissions", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const adminName = (req.session as any)?.adminName?.trim() || "Admin";
  const { id, status } = req.body;

  if (!id || !status) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }
  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status." });
    return;
  }

  const now = new Date().toISOString();
  const updateData: any = { status };
  if (status === "approved") {
    updateData.approvedBy = adminName;
    updateData.approvedAt = now;
    updateData.rejectedBy = null;
    updateData.rejectedAt = null;
  } else if (status === "rejected") {
    updateData.rejectedBy = adminName;
    updateData.rejectedAt = now;
    updateData.approvedBy = null;
    updateData.approvedAt = null;
  }

  await db.update(submissionsTable).set(updateData).where(eq(submissionsTable.id, id));
  const rows = await db.select().from(submissionsTable).where(eq(submissionsTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Submission not found." });
    return;
  }
  res.json({ ok: true, submission: submissionToApi(rows[0]) });
});

// POST /api/submissions/:id/engagement — track views/downloads
router.post("/submissions/:id/engagement", async (req, res) => {
  const { id } = req.params;
  const { metric } = req.body;

  if (!metric || !["views", "downloads"].includes(metric)) {
    res.status(400).json({ error: "Invalid metric." });
    return;
  }

  const rows = await db.select().from(submissionsTable).where(eq(submissionsTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Submission not found." });
    return;
  }

  const current = rows[0];
  const newVal = (Number(current[metric as keyof typeof current] ?? 0)) + 1;
  await db.update(submissionsTable).set({ [metric]: newVal }).where(eq(submissionsTable.id, id));
  res.json({ ok: true });
});

export default router;
