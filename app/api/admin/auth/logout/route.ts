import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  await deleteSession("admin");
  return NextResponse.json({ success: true });
}
