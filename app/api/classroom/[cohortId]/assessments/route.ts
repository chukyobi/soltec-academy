import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession().catch(() => null) ?? await getSession("tutor").catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const assessments = await (prisma as any).assessment.findMany({
      where: { cohortId },
      include: { 
        submissions: session.user.role === "STUDENT" ? { where: { userId: session.userId } } : true 
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(assessments);
  } catch (err) {
    return serverError(err, "GET assessments");
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, dueAt, maxScore } = await req.json();
    const assessment = await (prisma as any).assessment.create({
      data: {
        cohortId,
        title,
        description,
        dueAt: dueAt ? new Date(dueAt) : null,
        maxScore: maxScore ?? 100
      }
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (err) {
    return serverError(err, "POST assessment");
  }
}
