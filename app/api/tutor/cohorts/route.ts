import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTutor } from "@/lib/auth";

// GET /api/tutor/cohorts – get all cohorts assigned to the logged-in tutor
export async function GET() {
  try {
    const session = await requireTutor();
    const cohorts = await prisma.cohort.findMany({
      where: { tutorId: session.user.id },
      include: {
        course: { select: { id: true, title: true, slug: true, color: true, level: true, duration: true } },
        _count: { select: { enrollments: true, assignments: true } },
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        assignments: {
          include: { submissions: { include: { user: { select: { id: true, name: true } } } } },
        },
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
