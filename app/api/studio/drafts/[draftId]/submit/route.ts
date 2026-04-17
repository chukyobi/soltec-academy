import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCreator } from "@/lib/auth";

export async function POST(
  _req: Request,
  context: { params: Promise<{ draftId: string }> }
) {
  try {
    const session = await requireCreator();
    const { draftId } = await context.params;

    const draft = await prisma.courseDraft.findUnique({
      where: { id: draftId },
      include: { videos: { orderBy: { order: "asc" } } },
    });

    if (!draft || draft.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (draft.status === "SUBMITTED") {
      return NextResponse.json({ error: "Already submitted" }, { status: 409 });
    }
    if (!draft.title || !draft.description || !draft.price || draft.videos.length === 0) {
      return NextResponse.json({ error: "Draft is incomplete" }, { status: 400 });
    }

    const course = await prisma.creatorCourse.create({
      data: {
        title: draft.title,
        description: draft.description,
        price: draft.price,
        thumbnail: draft.thumbnail,
        draftId: draft.id,
        creatorId: draft.creatorId,
        status: "PENDING",
        videos: {
          create: draft.videos.map((v) => ({
            title: v.title,
            description: v.description,
            order: v.order,
            fileUrl: v.fileUrl ?? "",
            isFree: v.isFree,
          })),
        },
      },
      include: { videos: true },
    });

    await prisma.courseDraft.update({
      where: { id: draft.id },
      data: { status: "SUBMITTED" },
    });

    await prisma.notification.create({
      data: {
        type: "NEW_COURSE",
        title: "New Course Awaiting Review",
        message: `"${draft.title}" by ${session.user.name ?? session.user.email} needs approval.`,
        metadata: { courseId: course.id, creatorId: session.user.id },
      },
    });

    return NextResponse.json({ success: true, courseId: course.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
