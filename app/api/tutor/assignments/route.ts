import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTutor } from "@/lib/auth";

// POST /api/tutor/assignments – create an assignment
export async function POST(req: Request) {
  try {
    const session = await requireTutor();
    const { cohortId, title, description } = await req.json();

    if (!cohortId || !title || !description) {
      return NextResponse.json({ error: "cohortId, title, and description required" }, { status: 400 });
    }

    // Verify tutor owns this cohort
    const cohort = await (prisma.cohort as any).findUnique({ 
      where: { id: cohortId },
      include: { tutors: { select: { id: true } } }
    });
    if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    
    const isTutor = (cohort.tutors as any[]).some((t: any) => t.id === session.userId) || session.user.role === "ADMIN";
    if (!isTutor) {
      return NextResponse.json({ error: "Not your cohort" }, { status: 403 });
    }

    const assignment = await (prisma.assignment as any).create({
      data: { title, description, cohortId },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
