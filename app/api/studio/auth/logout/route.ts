import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  await deleteSession("creator").catch(() => {});

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  return NextResponse.redirect(`${origin}/studio/login`);
}
