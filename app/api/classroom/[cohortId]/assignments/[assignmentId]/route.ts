import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// POST — student submits an assignment
export async function POST(
  req: Request,
  { params }: { params: Promise<{ cohortId: string; assignmentId: string }> }
) {
  try {
    const { cohortId, assignmentId } = await params;
    const session = await getSession().catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const assignment = await (prisma.assignment as any).findUnique({ where: { id: assignmentId } });
    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    if (!assignment.isOpen) {
      return NextResponse.json({ error: "This assignment is closed and no longer accepting submissions." }, { status: 403 });
    }

    if (assignment.dueAt && new Date() > assignment.dueAt) {
      // Auto-close past deadline
      await (prisma.assignment as any).update({ where: { id: assignmentId }, data: { isOpen: false } });
      return NextResponse.json({ error: "The submission deadline has passed for this assignment." }, { status: 403 });
    }

    const { content, fileUrl } = await req.json();
    if (!content && !fileUrl) {
      return NextResponse.json({ error: "Please provide a submission (text or file)" }, { status: 400 });
    }

    const submission = await (prisma.assignmentSubmission as any).upsert({
      where: { assignmentId_userId: { assignmentId, userId: session.userId } },
      update: { content, fileUrl, submittedAt: new Date() },
      create: { assignmentId, userId: session.userId, content, fileUrl },
    });
    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    return serverError(err, "POST assignment submission");
  }
}

// PATCH — tutor grades a submission
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cohortId: string; assignmentId: string }> }
) {
  try {
    const { cohortId, assignmentId } = await params;
    const session = await getSession("tutor").catch(() => null);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
    }

    const { submissionId, score, grade, feedback, isOpen } = await req.json();

    // Grade a submission
    if (submissionId) {
      const updated = await (prisma.assignmentSubmission as any).update({
        where: { id: submissionId },
        data: { score, grade, feedback },
      });

      // Trigger rank update
      try {
        await pusherServer.trigger(`classroom-${cohortId}`, 'new-message', {
          userId: 'system',
          content: "Ranks have been updated due to new grades!",
          createdAt: new Date()
        });
      } catch (e) {}

      return NextResponse.json(updated);
    }

    // Open/close the assignment itself
    if (typeof isOpen === "boolean") {
      const updated = await (prisma.assignment as any).update({
        where: { id: assignmentId },
        data: { isOpen },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch (err) {
    return serverError(err, "PATCH assignment");
  }
}
