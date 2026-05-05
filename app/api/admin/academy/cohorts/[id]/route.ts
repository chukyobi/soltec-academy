
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession("admin").catch(() => null);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, courseId, startDate, endDate, maxStudents, 
      partPaymentEnabled, partPaymentPercent, tutorIds, isActive 
    } = body;

    const cohort = await prisma.cohort.update({
      where: { id },
      data: {
        name,
        courseId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        maxStudents: maxStudents !== undefined ? Number(maxStudents) : undefined,
        partPaymentEnabled,
        partPaymentPercent: partPaymentPercent !== undefined ? Number(partPaymentPercent) : undefined,
        isActive,
        // Update tutors relationship
        tutors: tutorIds ? {
          set: tutorIds.map((tid: string) => ({ id: tid }))
        } : undefined,
      },
    });

    return NextResponse.json(cohort);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession("admin").catch(() => null);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if there are enrollments before deleting
    const enrollments = await prisma.cohortEnrollment.count({ where: { cohortId: id } });
    if (enrollments > 0) {
      return NextResponse.json({ error: "Cannot delete cohort with active enrollments. Freeze it instead." }, { status: 400 });
    }

    await prisma.cohort.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
