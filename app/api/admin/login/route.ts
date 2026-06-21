import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const password = String(body?.password || "");
  const name = String(body?.name || "").trim().slice(0, 40) || "Admin";

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set." },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid password." },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  cookieStore.set("admin-auth", "true", cookieOptions);
  cookieStore.set("admin-name", name, cookieOptions);

  return NextResponse.json({ ok: true, name });
}