import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

// GET all assignments for a cohort (with submission status for current user)
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession().catch(() => null) ?? await getSession("tutor").catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const assignments = await prisma.assignment.findMany({
      where: { cohortId },
      include: {
        submissions: session.user.role === "STUDENT"
          ? { where: { userId: session.userId } }
          : true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    } as any);
    return NextResponse.json(assignments);
  } catch (err) {
    return serverError(err, "GET assignments");
  }
}

// POST — tutor creates assignment
export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
    }

    const { title, description, dueAt, maxScore } = await req.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        cohortId,
        title,
        description,
        dueAt: dueAt ? new Date(dueAt) : null,
        maxScore: maxScore ?? 100,
        isOpen: true,
      } as any,
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch (err) {
    return serverError(err, "POST assignment");
  }
}
