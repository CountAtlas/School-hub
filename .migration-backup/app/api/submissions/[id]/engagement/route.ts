import { NextResponse } from "next/server";
import { incrementSubmissionMetric } from "@/app/lib/engagement";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const metric = body?.metric as "views" | "downloads" | undefined;

  if (!metric || !["views", "downloads"].includes(metric)) {
    return NextResponse.json(
      { error: "Invalid metric." },
      { status: 400 }
    );
  }

  const updated = await incrementSubmissionMetric(id, metric);

  if (!updated) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, submission: updated });
}