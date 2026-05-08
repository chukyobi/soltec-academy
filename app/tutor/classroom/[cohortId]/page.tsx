import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TutorClassroomClient from "./TutorClassroomClient";

export const revalidate = 0;

export default async function TutorClassroomPage({ params }:{ params: Promise<{cohortId:string}> }) {
  const { cohortId } = await params;
  const session = await getSession("tutor").catch(()=>null) as any;
  if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) redirect("/tutor/login");

  const cohort = await (prisma.cohort as any).findUnique({
    where: { id: cohortId },
    include: {
      course: { select: { title:true, color:true, slug:true } },
      settings: true,
      enrollments: { select: { id:true } },
      tutors: { select: { id:true } },
    },
  });

  if (!cohort) redirect("/tutor/dashboard");

  // Verify tutor is assigned to this cohort
  const isTutor = (cohort.tutors as any[]).some((t: any) => t.id === session.userId) || session.user.role === "ADMIN";
  if (!isTutor) redirect("/tutor/dashboard");

  return (
    <TutorClassroomClient
      cohort={{
        id: cohort.id,
        name: cohort.name,
        course: { title: cohort.course.title, color: cohort.course.color },
        totalStudents: cohort.enrollments.length,
        isLive: cohort.isLive,
        liveRoomId: cohort.liveRoomId,
      }}
      tutorName={session.user.name ?? "Tutor"}
      userId={session.userId}
      userEmail={session.user.email}
      userImage={session.user.image}
      initSettings={cohort.settings ?? null}
    />
  );
}
