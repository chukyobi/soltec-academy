import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    await requireAdmin();
    const { courseId } = await context.params;
    const { reason } = await req.json().catch(() => ({ reason: "" }));

    const course = await prisma.creatorCourse.update({
      where: { id: courseId },
      data: { status: "REJECTED" },
    });

    await prisma.notification.create({
      data: {
        type: "COURSE_REJECTED",
        title: "Course Needs Revision",
        message: `"${course.title}" was not approved. ${reason ? `Reason: ${reason}` : ""}`,
        metadata: { courseId: course.id, reason },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
