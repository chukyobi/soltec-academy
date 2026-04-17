import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ClassroomClient from "./ClassroomClient";

export default async function LearnCoursePage({ params }: { params: { courseId: string } }) {
  const session = await getSession();
  if (!session) redirect(`/studio/login?next=/learn/${params.courseId}`);

  const course = await prisma.creatorCourse.findUnique({
    where: { id: params.courseId, status: "APPROVED" },
    include: {
      videos: { orderBy: { order: "asc" } },
      creator: { select: { name: true } },
    },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    include: { progress: true },
  });

  if (!enrollment) {
    // Not enrolled — redirect to course detail page
    redirect(`/learning/creator/${course.id}`);
  }

  const progressMap = Object.fromEntries(
    enrollment.progress.map(p => [p.videoId, p])
  );

  return (
    <ClassroomClient
      course={{
        id: course.id,
        title: course.title,
        creatorName: course.creator.name ?? "Instructor",
        videos: course.videos,
      }}
      progressMap={progressMap}
      enrollmentId={enrollment.id}
    />
  );
}
