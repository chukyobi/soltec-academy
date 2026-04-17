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
    const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    if (session.user.role === "TUTOR" && cohort.tutorId !== session.user.id) {
      return NextResponse.json({ error: "Not your cohort" }, { status: 403 });
    }

    const assignment = await prisma.assignment.create({
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
