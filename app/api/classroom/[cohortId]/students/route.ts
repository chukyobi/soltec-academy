import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

// GET students in cohort with their classroom status
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const studentSession = await getSession().catch(() => null);
    const tutorSession = await getSession("tutor").catch(() => null);
    const session = studentSession ?? tutorSession;

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const enrollments = await prisma.cohortEnrollment.findMany({
      where: { cohortId },
      include: {
        user: {
          select: { id: true, name: true, email: true, studentId: true, image: true, role: true },
        },
      },
    });

    // If student, return simplified list for mentions
    if (session.user.role === "STUDENT" && !tutorSession) {
      const simplified = enrollments.map(e => ({
        id: e.user.id,
        name: e.user.name,
        image: e.user.image,
        role: e.user.role
      }));
      return NextResponse.json(simplified);
    }

    const statuses = await (prisma as any).studentClassroomStatus.findMany({ where: { cohortId } });
    const statusMap = Object.fromEntries(statuses.map((s: any) => [s.userId, s]));

    const data = enrollments.map(e => ({
      ...e.user,
      status: statusMap[e.user.id]?.status ?? "ACTIVE",
      statusReason: statusMap[e.user.id]?.reason ?? null,
    }));

    return NextResponse.json(data);
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
