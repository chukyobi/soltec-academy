import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

// GET — attendance sessions + records for cohort
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession().catch(() => null) ?? await getSession("tutor").catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await prisma.attendanceSession.findMany({
      where: { cohortId },
      include: { records: { include: { user: { select: { id: true, name: true, studentId: true } } } } },
      orderBy: { openedAt: "desc" },
    } as any);
    return NextResponse.json(sessions);
  } catch (err) {
    return serverError(err, "GET attendance");
  }
}

// POST — tutor opens a new session OR student checks in
export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const tutorSession = await getSession("tutor").catch(() => null);
    const studentSession = await getSession().catch(() => null);
    const session = tutorSession ?? studentSession;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Tutor opens a session
    if (body.action === "open" && (session.user.role === "TUTOR" || session.user.role === "ADMIN")) {
      const existing = await prisma.attendanceSession.findFirst({
        where: { cohortId, closedAt: null },
      });
      if (existing) return NextResponse.json({ error: "An attendance session is already open" }, { status: 409 });

      const s = await (prisma.attendanceSession as any).create({
        data: { cohortId, label: body.label ?? null },
      });
      return NextResponse.json(s, { status: 201 });
    }

    // Tutor closes a session
    if (body.action === "close" && (session.user.role === "TUTOR" || session.user.role === "ADMIN")) {
      const s = await (prisma.attendanceSession as any).update({
        where: { id: body.sessionId },
        data: { closedAt: new Date() },
      });
      return NextResponse.json(s);
    }

    // Student checks in
    if (body.action === "checkin") {
      const openSession = await prisma.attendanceSession.findFirst({
        where: { cohortId, closedAt: null },
      });
      if (!openSession) return NextResponse.json({ error: "No attendance session is open right now" }, { status: 400 });

      const record = await (prisma.attendanceRecord as any).upsert({
        where: { sessionId_userId: { sessionId: openSession.id, userId: session.userId } },
        update: {},
        create: { sessionId: openSession.id, userId: session.userId },
      });
      return NextResponse.json(record, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return serverError(err, "POST attendance");
  }
}
