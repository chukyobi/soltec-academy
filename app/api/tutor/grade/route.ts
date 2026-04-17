import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTutor } from "@/lib/auth";

// POST /api/tutor/grade – grade a submission
export async function POST(req: Request) {
  try {
    await requireTutor();
    const { submissionId, grade } = await req.json();

    if (!submissionId || !grade) {
      return NextResponse.json({ error: "submissionId and grade required" }, { status: 400 });
    }

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { grade },
    });

    return NextResponse.json(submission);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
