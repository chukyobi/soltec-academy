import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// GET — attendance sessions + records for cohort
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const studentSession = await getSession("student").catch(() => null);
    const tutorSession = await getSession("tutor").catch(() => null);
    const session = (studentSession || tutorSession) as any;

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await (prisma as any).attendanceSession.findMany({
      where: { cohortId },
      include: { records: { include: { user: { select: { id: true, name: true, studentId: true } } } } },
      orderBy: { openedAt: "desc" },
    });
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
    const session = (tutorSession || studentSession) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Tutor opens a session
    if (body.action === "open" && (session.user.role === "TUTOR" || session.user.role === "ADMIN")) {
      const existing = await (prisma as any).attendanceSession.findFirst({
        where: { cohortId, closedAt: null },
      });
      if (existing) return NextResponse.json({ error: "An attendance session is already open" }, { status: 409 });

      const s = await (prisma as any).attendanceSession.create({
        data: { cohortId, label: body.label ?? null },
      });
      await pusherServer.trigger(`classroom-${cohortId}`, 'attendance-updated', { action: 'open' });
      return NextResponse.json(s, { status: 201 });
    }

    // Tutor closes a session
    if (body.action === "close" && (session.user.role === "TUTOR" || session.user.role === "ADMIN")) {
      const s = await (prisma as any).attendanceSession.update({
        where: { id: body.sessionId },
        data: { closedAt: new Date() },
      });
      await pusherServer.trigger(`classroom-${cohortId}`, 'attendance-updated', { action: 'close' });
      return NextResponse.json(s);
    }

    // Student checks in
    if (body.action === "checkin") {
      const openSession = await (prisma as any).attendanceSession.findFirst({
        where: { cohortId, closedAt: null },
      });
      if (!openSession) return NextResponse.json({ error: "No attendance session is open right now" }, { status: 400 });

      const record = await (prisma as any).attendanceRecord.upsert({
        where: { sessionId_userId: { sessionId: openSession.id, userId: session.userId } },
        update: {},
        create: { sessionId: openSession.id, userId: session.userId },
      });
      await pusherServer.trigger(`classroom-${cohortId}`, 'attendance-updated', { action: 'checkin' });
      return NextResponse.json(record, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return serverError(err, "POST attendance");
  }
}
