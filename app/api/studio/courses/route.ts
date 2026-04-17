import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCreator } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Real auth — requires a valid creator session cookie
    const session = await requireCreator();

    const { title, description, price } = await req.json();

    if (!title || !description || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const course = await prisma.creatorCourse.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        status: "PENDING",
        creatorId: session.user.id,
      },
    });

    // Notify admins
    await prisma.notification.create({
      data: {
        type: "NEW_COURSE",
        title: "New Course Awaiting Review",
        message: `"${title}" by ${session.user.name ?? session.user.email} needs approval.`,
        metadata: { courseId: course.id, creatorId: session.user.id },
      },
    }).catch(() => {}); // non-fatal

    return NextResponse.json({
      success: true,
      message: "Course uploaded and awaiting approval",
      course,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN") {
      return NextResponse.json({ error: "You must be a signed-in creator to upload courses." }, { status: 401 });
    }
    console.error("Course creation error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
