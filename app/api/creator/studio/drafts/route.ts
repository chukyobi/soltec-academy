import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serverError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getSession("creator").catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const drafts = await prisma.courseDraft.findMany({
      where: { creatorId: session.userId },
      orderBy: { updatedAt: "desc" },
      include: { videos: true }
    });

    return NextResponse.json({ drafts });
  } catch (err) {
    return serverError(err, "GET drafts");
  }
}
