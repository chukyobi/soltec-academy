import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";

// POST /api/student/submit-assignment
export async function POST(req: Request) {
  try {
    const session = await requireStudent();
    const { assignmentId, fileUrl } = await req.json();

    if (!assignmentId || !fileUrl) {
      return NextResponse.json({ error: "assignmentId and fileUrl required" }, { status: 400 });
    }

    // Check not already submitted
    const existing = await prisma.assignmentSubmission.findFirst({
      where: { assignmentId, userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Already submitted" }, { status: 409 });
    }

    const submission = await prisma.assignmentSubmission.create({
      data: { assignmentId, userId: session.user.id, fileUrl },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
