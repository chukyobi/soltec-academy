import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// GET — list scheduled live sessions for a cohort
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null) ?? await getSession("student").catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await (prisma as any).liveSession.findMany({
      where: { cohortId },
      include: { tutor: { select: { name: true, image: true } } },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(sessions);
  } catch (err) {
    return serverError(err, "GET live sessions");
  }
}

// POST — tutor schedules a live session
export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null) as any;
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
    }

    const { title, description, scheduledAt } = await req.json();
    if (!title || !scheduledAt) return NextResponse.json({ error: "Title and time are required" }, { status: 400 });

    const liveSession = await (prisma as any).liveSession.create({
      data: {
        cohortId,
        tutorId: session.userId,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
      },
    });

    // ── Notify Students via Pusher ──────────────────────────────────────────
    try {
      await pusherServer.trigger(`classroom-${cohortId}`, 'session-scheduled', {
        title,
        scheduledAt,
        tutorName: session.user.name,
      });

      // Also trigger a general notification for the dashboard
      await pusherServer.trigger(`cohort-${cohortId}`, 'new-notification', {
        type: 'live-session',
        message: `New class scheduled: ${title} on ${new Date(scheduledAt).toLocaleString()}`,
        cohortId
      });
    } catch (pErr) {
      console.error("Pusher Notify Failed:", pErr);
    }

    return NextResponse.json(liveSession, { status: 201 });
  } catch (err) {
    return serverError(err, "POST live session");
  }
}
