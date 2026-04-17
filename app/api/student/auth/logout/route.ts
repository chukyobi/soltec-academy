import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/student/auth/logout
export async function GET() {
  await deleteSession().catch(() => {});

  // Derive origin from request headers for redirect
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  return NextResponse.redirect(`${origin}/`);
}
