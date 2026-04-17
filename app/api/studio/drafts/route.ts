import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCreator } from "@/lib/auth";

// POST /api/studio/drafts — create or update a course draft with video list
export async function POST(req: Request) {
  try {
    const session = await requireCreator();
    const { draftId, title, description, price, thumbnail, zipFileUrl, videos } = await req.json();

    // videos: Array<{ fileName, title, description, order, isFree, fileUrl? }>

    if (draftId) {
      // Update existing draft
      await prisma.draftVideo.deleteMany({ where: { draftId } });
      const draft = await prisma.courseDraft.update({
        where: { id: draftId, creatorId: session.user.id },
        data: {
          title, description, price, thumbnail, zipFileUrl,
          videos: {
            create: videos.map((v: { fileName: string; title: string; description?: string; order: number; isFree?: boolean; fileUrl?: string }) => ({
              fileName: v.fileName,
              title: v.title,
              description: v.description,
              order: v.order,
              isFree: v.isFree ?? false,
              fileUrl: v.fileUrl,
            })),
          },
        },
        include: { videos: { orderBy: { order: "asc" } } },
      });
      return NextResponse.json({ success: true, draft });
    }

    // Create new draft
    const draft = await prisma.courseDraft.create({
      data: {
        creatorId: session.user.id,
        title, description, price, thumbnail, zipFileUrl,
        videos: {
          create: videos.map((v: { fileName: string; title: string; description?: string; order: number; isFree?: boolean; fileUrl?: string }) => ({
            fileName: v.fileName,
            title: v.title,
            description: v.description,
            order: v.order,
            isFree: v.isFree ?? false,
            fileUrl: v.fileUrl,
          })),
        },
      },
      include: { videos: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, draft }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/studio/drafts — list my drafts
export async function GET() {
  try {
    const session = await requireCreator();
    const drafts = await prisma.courseDraft.findMany({
      where: { creatorId: session.user.id },
      include: { videos: { orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ drafts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
