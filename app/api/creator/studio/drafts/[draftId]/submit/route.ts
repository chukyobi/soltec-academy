import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await getSession("creator").catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const draft = await prisma.courseDraft.findUnique({
      where: { id: draftId, creatorId: session.userId },
      include: { videos: true }
    });

    if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    if (!draft.title || !draft.description || !draft.price || draft.videos.length === 0) {
      return NextResponse.json({ error: "Draft incomplete" }, { status: 400 });
    }

    // Create CreatorCourse from draft
    const course = await prisma.creatorCourse.create({
      data: {
        title: draft.title,
        description: draft.description,
        price: draft.price,
        creatorId: session.userId,
        draftId: draft.id,
        status: "PENDING",
        videos: {
          create: draft.videos.map(v => ({
            title: v.title,
            description: v.description,
            order: v.order,
            fileUrl: v.fileUrl || "",
            isFree: v.isFree
          }))
        }
      }
    });

    // Update draft status
    await prisma.courseDraft.update({
      where: { id: draftId },
      data: { status: "SUBMITTED" }
    });

    // TODO: Send notification to Admin for review

    return NextResponse.json({ success: true, courseId: course.id });
  } catch (err) {
    return serverError(err, "POST submit draft");
  }
}
