import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCreator } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await requireCreator();
    const { bio, specialty, website, avatarUrl } = await req.json();

    const profile = await prisma.creatorProfile.upsert({
      where: { userId: session.user.id },
      update: { bio, specialty, website, avatarUrl },
      create: { userId: session.user.id, bio, specialty, website, avatarUrl },
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
