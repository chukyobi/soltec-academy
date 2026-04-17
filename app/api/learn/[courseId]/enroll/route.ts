import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const session = await getSession();
    const { reference, email } = await req.json();

    let userId = session?.user.id;
    if (!userId && email) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, role: "STUDENT" },
      });
      userId = user.id;
    }
    if (!userId) return NextResponse.json({ error: "User not identified" }, { status: 400 });

    const course = await prisma.creatorCourse.findUnique({
      where: { id: courseId, status: "APPROVED" },
    });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (existing) return NextResponse.json({ success: true, enrollment: existing });

    await prisma.purchase.create({
      data: { userId, courseId: course.id, amount: course.price, reference },
    }).catch(() => {});

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId: course.id },
    });

    await prisma.notification.create({
      data: {
        type: "NEW_ENROLLMENT",
        title: "New Student Enrolled",
        message: `A student enrolled in "${course.title}".`,
        metadata: { courseId: course.id, enrollmentId: enrollment.id },
      },
    });

    return NextResponse.json({ success: true, enrollment }, { status: 201 });
  } catch (err) {
    console.error("Enroll error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
