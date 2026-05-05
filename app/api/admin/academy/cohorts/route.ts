import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/academy/cohorts
export async function GET() {
  try {
    await requireAdmin();
    const cohorts = await prisma.cohort.findMany({
      include: {
        course: { select: { id: true, title: true, slug: true, color: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(cohorts);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/academy/cohorts – create a cohort and assign a tutor
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const {
      name, courseId,
      startDate, endDate,
      maxStudents, partPaymentEnabled, partPaymentPercent,
      tutorIds, // NEW: Expecting an array of tutor IDs
    } = body;

    if (!name || !courseId) {
      return NextResponse.json({ error: "name and courseId are required" }, { status: 400 });
    }

    const cohort = await prisma.cohort.create({
      data: {
        name,
        courseId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxStudents: maxStudents ?? 20,
        partPaymentEnabled: partPaymentEnabled ?? true,
        partPaymentPercent: partPaymentPercent ?? 50,
        // NEW: Connect multiple tutors via many-to-many relationship
        tutors: tutorIds && Array.isArray(tutorIds) ? {
          connect: tutorIds.map((id: string) => ({ id }))
        } : undefined,
      },
      include: {
        course: { select: { title: true, slug: true } },
        tutors: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(cohort, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
