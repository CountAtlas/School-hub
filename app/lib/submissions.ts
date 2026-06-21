import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type Board = "CBSE" | "ISC";
export type SubmissionSection = "notes" | "practicals" | "resources";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  title: string;
  subject: string;
  board?: Board;
  classLevel: "11" | "12";
  section: SubmissionSection;
  author?: string;
  description?: string;
  originalFileName: string;
  storedFileName: string;
  fileUrl: string;
  mimeType: string;
  status: SubmissionStatus;
  createdAt: string;
  views?: number;
  downloads?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), "app", "data");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const DB_PATH = path.join(DATA_DIR, "submissions.json");

async function ensureDbFile() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    await writeFile(DB_PATH, "[]", "utf8");
  }
}

export async function readSubmissions(): Promise<Submission[]> {
  await ensureDbFile();
  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as Submission[];
}

export async function writeSubmissions(items: Submission[]) {
  await ensureDbFile();
  await writeFile(DB_PATH, JSON.stringify(items, null, 2), "utf8");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getExtension(fileName: string, mimeType: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext) return ext;

  if (mimeType === "application/pdf") return ".pdf";
  if (mimeType.startsWith("image/")) return `.${mimeType.split("/")[1]}`;
  if (mimeType === "text/plain") return ".txt";
  if (mimeType === "application/zip") return ".zip";
  if (mimeType === "text/x-python" || mimeType === "text/python") return ".py";

  return "";
}

export async function saveUpload(file: File, title: string) {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = getExtension(file.name, file.type);
  const safeTitle = slugify(title || "submission");
  const storedFileName = `${safeTitle}-${randomUUID()}${ext || path.extname(file.name)}`;

  const filePath = path.join(UPLOAD_DIR, storedFileName);
  await writeFile(filePath, buffer);

  return {
    storedFileName,
    fileUrl: `/uploads/${storedFileName}`,
  };
}