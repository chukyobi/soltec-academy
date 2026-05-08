import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// POST /api/classroom/[cohortId]/live – Toggle live status
export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null) as any;
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
    }

    const { isLive } = await req.json();

    const updated = await (prisma.cohort as any).update({
      where: { id: cohortId },
      data: {
        isLive,
        liveRoomId: isLive ? `room-${cohortId}-${Date.now()}` : null,
      },
    });

    // ── Notify Students via Pusher ──────────────────────────────────────────
    try {
      await pusherServer.trigger(`classroom-${cohortId}`, 'live-status-changed', {
        isLive,
        roomName: `classroom-${cohortId}`,
        tutorName: session.user.name,
      });

      // Also send a system message to the chat
      await pusherServer.trigger(`classroom-${cohortId}`, 'new-message', {
        id: `sys-${Date.now()}`,
        userId: 'system',
        content: isLive 
          ? `🚀 Tutor ${session.user.name} has started a Live Class! [JOIN_LIVE_STREAM]` 
          : `⏹️ The Live Class has ended.`,
        createdAt: new Date(),
        user: { name: 'System', role: 'ADMIN' }
      });
    } catch (pErr) {
      console.error("Pusher Live Notify Failed:", pErr);
    }

    return NextResponse.json(updated);
  } catch (err) {
    return serverError(err, "POST toggle live");
  }
}
