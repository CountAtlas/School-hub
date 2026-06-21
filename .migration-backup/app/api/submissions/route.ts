import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  readSubmissions,
  saveUpload,
  writeSubmissions,
  type Submission,
  type Board,
} from "../../lib/submissions";

export const runtime = "nodejs";

function isAdmin(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore.get("admin-auth")?.value === "true";
}

export async function GET() {
  const cookieStore = await cookies();

  if (!isAdmin(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await readSubmissions();
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const classLevel = String(formData.get("classLevel") || "").trim();
  const section = String(formData.get("section") || "").trim();
  const board = String(formData.get("board") || "CBSE").trim().toUpperCase();
  const author = String(formData.get("author") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const rawFile = formData.get("file");

  const allowedClassLevels = ["11", "12"] as const;
  const allowedSections = ["notes", "practicals", "resources"] as const;
  const allowedBoards = ["CBSE", "ISC"] as const;

  if (
    !title ||
    !subject ||
    !classLevel ||
    !section ||
    !board ||
    !rawFile
  ) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (!(rawFile instanceof File)) {
    return NextResponse.json(
      { error: "Invalid file." },
      { status: 400 }
    );
  }

  if (!allowedClassLevels.includes(classLevel as (typeof allowedClassLevels)[number])) {
    return NextResponse.json(
      { error: "Invalid class level." },
      { status: 400 }
    );
  }

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    return NextResponse.json(
      { error: "Invalid section." },
      { status: 400 }
    );
  }

  if (!allowedBoards.includes(board as (typeof allowedBoards)[number])) {
    return NextResponse.json(
      { error: "Invalid board." },
      { status: 400 }
    );
  }

  const upload = await saveUpload(rawFile, title);
  const submissions = await readSubmissions();

  const entry: Submission = {
    id: crypto.randomUUID(),
    title,
    subject,
    board: board as Board,
    classLevel: classLevel as "11" | "12",
    section: section as "notes" | "practicals" | "resources",
    author: author || undefined,
    description: description || undefined,
    originalFileName: rawFile.name,
    storedFileName: upload.storedFileName,
    fileUrl: upload.fileUrl,
    mimeType: rawFile.type || "application/octet-stream",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  submissions.unshift(entry);
  await writeSubmissions(submissions);

  return NextResponse.json({ ok: true, submission: entry });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();

  if (!isAdmin(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminName =
    cookieStore.get("admin-name")?.value?.trim() || "Admin";

  const body = await request.json().catch(() => null);

  if (!body || typeof body.id !== "string" || typeof body.status !== "string") {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const status = body.status as Submission["status"];

  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status." },
      { status: 400 }
    );
  }

  const submissions = await readSubmissions();
  const index = submissions.findIndex((item) => item.id === body.id);

  if (index === -1) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();

  submissions[index] = {
    ...submissions[index],
    status,
    approvedBy: status === "approved" ? adminName : undefined,
    approvedAt: status === "approved" ? now : undefined,
    rejectedBy: status === "rejected" ? adminName : undefined,
    rejectedAt: status === "rejected" ? now : undefined,
  };

  await writeSubmissions(submissions);

  return NextResponse.json({ ok: true, submission: submissions[index] });
}