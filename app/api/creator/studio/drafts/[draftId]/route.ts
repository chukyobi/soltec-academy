import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serverError } from "@/lib/api-error";

export async function GET(req: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await getSession("creator").catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const draft = await prisma.courseDraft.findUnique({
      where: { id: draftId, creatorId: session.userId },
      include: { videos: { orderBy: { order: "asc" } } }
    });

    if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    return NextResponse.json({ draft });
  } catch (err) {
    return serverError(err, "GET draft detail");
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await getSession("creator").catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, price, videos } = await req.json();

    // Update main draft
    const updatedDraft = await prisma.courseDraft.update({
      where: { id: draftId, creatorId: session.userId },
      data: { title, description, price }
    });

    // Update videos (batch update for order/titles)
    if (videos && Array.isArray(videos)) {
      for (const v of videos) {
        await prisma.draftVideo.update({
          where: { id: v.id, draftId: draftId },
          data: { 
            title: v.title, 
            order: v.order,
            isFree: v.isFree
          }
        });
      }
    }

    return NextResponse.json({ success: true, draft: updatedDraft });
  } catch (err) {
    return serverError(err, "PATCH draft");
  }
}
