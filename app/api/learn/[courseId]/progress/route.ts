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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { videoId, progressSec, completed } = await req.json();

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });
    if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

    const progress = await prisma.videoProgress.upsert({
      where: { enrollmentId_videoId: { enrollmentId: enrollment.id, videoId } },
      update: { progressSec, completed, lastWatchedAt: new Date() },
      create: { enrollmentId: enrollment.id, videoId, progressSec, completed, lastWatchedAt: new Date() },
    });

    if (completed) {
      const [total, done] = await Promise.all([
        prisma.courseVideo.count({ where: { courseId } }),
        prisma.videoProgress.count({ where: { enrollmentId: enrollment.id, completed: true } }),
      ]);
      if (done >= total) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { completedAt: new Date() },
        });
      }
    }

    return NextResponse.json({ success: true, progress });
  } catch (err) {
    console.error("Progress error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ enrolled: false });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      include: { progress: true },
    });

    return NextResponse.json({ enrolled: !!enrollment, enrollment });
  } catch {
    return NextResponse.json({ enrolled: false });
  }
}
