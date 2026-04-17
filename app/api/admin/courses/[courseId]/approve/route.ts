import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _req: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    await requireAdmin();
    const { courseId } = await context.params;

    const course = await prisma.creatorCourse.update({
      where: { id: courseId },
      data: { status: "APPROVED" },
      include: { creator: { select: { name: true, email: true } } },
    });

    await prisma.notification.create({
      data: {
        type: "COURSE_APPROVED",
        title: "Course Approved ✓",
        message: `"${course.title}" has been approved and is now live on the catalog.`,
        metadata: { courseId: course.id },
      },
    });

    return NextResponse.json({ success: true, course });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
