import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import StudentClassroomClient from "./StudentClassroomClient";

export const revalidate = 0;

export default async function StudentClassroomPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const session = await getSession().catch(() => null) as any;
  if (!session) redirect(`/student/login?redirect=/student/classroom/${cohortId}`);

  const enrollment = await (prisma.cohortEnrollment as any).findUnique({
    where: { userId_cohortId: { userId: session.userId, cohortId } },
    include: {
      cohort: {
        include: {
          course: true,
          settings: true,
          tutors: { select: { id: true, name: true, image: true } },
          enrollments: { select: { id: true } },
        },
      },
    },
  });

  if (!enrollment) redirect("/student/profile");

  const classroomStatus = await (prisma as any).studentClassroomStatus.findUnique({
    where: { cohortId_userId: { cohortId, userId: session.userId } },
  });

  const cohort = (enrollment as any).cohort;
  const modules = Array.isArray(cohort.course.modules)
    ? (cohort.course.modules as { title: string; lessons: { title: string }[] }[])
    : [];
  const totalLessons = modules.reduce((s: number, m: any) => s + (m.lessons?.length ?? 0), 0);
  const settings = cohort.settings;

  return (
    <StudentClassroomClient
      cohort={{
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate?.toISOString() ?? null,
        endDate: cohort.endDate?.toISOString() ?? null,
        totalStudents: cohort.enrollments.length,
        tutors: cohort.tutors,
        isLive: cohort.isLive,
        liveRoomId: cohort.liveRoomId,
        course: {
          title: cohort.course.title,
          slug: cohort.course.slug,
          color: cohort.course.color,
          level: cohort.course.level,
          duration: cohort.course.duration,
        },
        settings: settings
          ? {
              welcomeNote: settings.welcomeNote,
              rules: settings.rules,
              passThreshold: settings.passThreshold,
              attendanceWeight: settings.attendanceWeight,
              assignmentWeight: settings.assignmentWeight,
              participationWeight: settings.participationWeight,
            }
          : null,
        myStatus: (classroomStatus?.status as any) ?? null,
      }}
      modules={modules}
      totalLessons={totalLessons}
      studentName={session.user.name ?? "Student"}
      studentId={session.user.studentId ?? ""}
      userId={session.userId}
      isFirstVisit={!session.user.hasSeenWelcome}
    />
  );
}
