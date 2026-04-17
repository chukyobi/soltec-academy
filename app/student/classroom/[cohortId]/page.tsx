import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  ArrowLeft, BookOpen, Clock, CheckCircle2, Lock,
  MessageSquare, ClipboardList, Award, ChevronDown,
  Play, FileUp, Loader2
} from "lucide-react";
import StudentClassroomClient from "./StudentClassroomClient";

export const revalidate = 0;

export default async function StudentClassroomPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const session = await getSession().catch(() => null);
  if (!session) redirect(`/student/login?redirect=/student/classroom/${cohortId}`);

  // Verify enrollment
  const enrollment = await prisma.cohortEnrollment.findUnique({
    where: { userId_cohortId: { userId: session.user.id, cohortId } },
    include: {
      cohort: {
        include: {
          course: true,
          assignments: {
            include: {
              submissions: { where: { userId: session.user.id } },
            },
          },
          enrollments: { select: { id: true } },
        },
      },
    },
  });

  if (!enrollment) {
    redirect("/student/profile");
  }

  const cohort = enrollment.cohort;
  const modules = Array.isArray(cohort.course.modules)
    ? (cohort.course.modules as {
        id: string;
        title: string;
        videos: { id: string; title: string; duration: string; isFree: boolean }[];
      }[])
    : [];

  const totalLessons = modules.reduce((s, m) => s + m.videos.length, 0);

  const serialCohort = {
    id: cohort.id,
    name: cohort.name,
    startDate: cohort.startDate?.toISOString() ?? null,
    endDate: cohort.endDate?.toISOString() ?? null,
    tutorName: cohort.tutorName,
    totalStudents: cohort.enrollments.length,
    course: {
      title: cohort.course.title,
      slug: cohort.course.slug,
      color: cohort.course.color,
      level: cohort.course.level,
      duration: cohort.course.duration,
    },
    assignments: cohort.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      mySubmission: a.submissions[0] ?? null,
    })),
    enrollment: {
      paymentStatus: enrollment.paymentStatus,
      amountPaid: enrollment.amountPaid,
      totalAmount: enrollment.totalAmount,
    },
  };

  return (
    <StudentClassroomClient
      cohort={serialCohort}
      modules={modules}
      totalLessons={totalLessons}
      studentName={session.user.name ?? "Student"}
    />
  );
}
