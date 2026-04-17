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
      name, courseId, tutorUserId,
      startDate, endDate,
      maxStudents, price, partPaymentEnabled, partPaymentPercent,
    } = body;

    if (!name || !courseId) {
      return NextResponse.json({ error: "name and courseId are required" }, { status: 400 });
    }

    // Resolve tutor name from user record if tutorUserId is given
    let tutorName: string | null = null;
    if (tutorUserId) {
      const tutor = await prisma.user.findUnique({ where: { id: tutorUserId } });
      if (!tutor || tutor.role !== "TUTOR") {
        return NextResponse.json({ error: "Invalid tutor user ID" }, { status: 400 });
      }
      tutorName = tutor.name ?? tutor.email;
    }

    const cohort = await prisma.cohort.create({
      data: {
        name,
        courseId,
        tutorId: tutorUserId ?? null,
        tutorName,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxStudents: maxStudents ?? 20,
        price: price ?? 100000,
        partPaymentEnabled: partPaymentEnabled ?? true,
        partPaymentPercent: partPaymentPercent ?? 50,
      },
      include: {
        course: { select: { title: true, slug: true } },
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
