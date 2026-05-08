import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

// GET students in cohort with their classroom status
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const studentSession = await getSession("student").catch(() => null);
    const tutorSession = await getSession("tutor").catch(() => null);
    const session = (studentSession || tutorSession) as any;

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        tutors: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      }
    });

    const enrollments = await (prisma.cohortEnrollment as any).findMany({
      where: { cohortId },
      include: {
        user: {
          select: { id: true, name: true, email: true, studentId: true, image: true, role: true },
        },
      },
    });

    const tutors = cohort?.tutors || [];

    // If student, return simplified list for mentions
    if (session.user.role === "STUDENT" && !tutorSession) {
      const simplifiedStudents = enrollments.map((e: any) => ({
        id: e.user.id,
        name: e.user.name,
        image: e.user.image,
        role: e.user.role
      }));
      const simplifiedTutors = tutors.map((t: any) => ({
        id: t.id,
        name: t.name,
        image: t.image,
        role: t.role
      }));
      return NextResponse.json([...simplifiedTutors, ...simplifiedStudents]);
    }

    const statuses = await (prisma as any).studentClassroomStatus.findMany({ where: { cohortId } });
    const statusMap = Object.fromEntries(statuses.map((s: any) => [s.userId, s]));

    const studentData = enrollments.map((e: any) => ({
      ...e.user,
      status: statusMap[e.user.id]?.status ?? "ACTIVE",
      statusReason: statusMap[e.user.id]?.reason ?? null,
    }));

    return NextResponse.json([...tutors, ...studentData]);
  } catch (err) {
    return serverError(err, "GET classroom students");
  }
}

// PATCH — suspend / kick / restore a student
export async function PATCH(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
    }

    const { userId, status, reason } = await req.json();
    if (!userId || !status) return NextResponse.json({ error: "userId and status are required" }, { status: 400 });

    const record = await (prisma as any).studentClassroomStatus.upsert({
      where: { cohortId_userId: { cohortId, userId } },
      update: { status, reason },
      create: { cohortId, userId, status, reason },
    });
    return NextResponse.json(record);
  } catch (err) {
    return serverError(err, "PATCH student status");
  }
}
