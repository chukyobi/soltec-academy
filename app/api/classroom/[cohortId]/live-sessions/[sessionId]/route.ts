import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// PATCH /api/classroom/[cohortId]/live-sessions/[sessionId]
// Body: { action: "start" | "stop" | "join" | "leave" }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cohortId: string; sessionId: string }> }
) {
  try {
    const { cohortId, sessionId } = await params;
    const session = await getSession("tutor").catch(() => null) ?? await getSession("student").catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json();

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!liveSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    let updatedSession;

    if (action === "start") {
      // Only tutor can start
      if (session.user.role !== "TUTOR" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
      }
      updatedSession = await prisma.liveSession.update({
        where: { id: sessionId },
        data: { isStarted: true, isEnded: false, participantCount: 1 }, // Tutor is the first
      });
      await pusherServer.trigger(`classroom-${cohortId}`, 'stream-status', { sessionId, status: 'started' });
    } 
    
    else if (action === "stop") {
      // Tutor or system can stop
      updatedSession = await prisma.liveSession.update({
        where: { id: sessionId },
        data: { isEnded: true, isStarted: false, participantCount: 0 },
      });
      await pusherServer.trigger(`classroom-${cohortId}`, 'stream-status', { sessionId, status: 'ended' });
    }

    else if (action === "join") {
      updatedSession = await prisma.liveSession.update({
        where: { id: sessionId },
        data: { participantCount: { increment: 1 } },
      });
    }

    else if (action === "leave") {
      // Decrement and check for auto-stop
      const newCount = Math.max(0, liveSession.participantCount - 1);
      
      if (newCount === 0 && liveSession.isStarted) {
        // AUTO STOP
        updatedSession = await prisma.liveSession.update({
          where: { id: sessionId },
          data: { isEnded: true, isStarted: false, participantCount: 0 },
        });
        await pusherServer.trigger(`classroom-${cohortId}`, 'stream-status', { sessionId, status: 'ended' });
      } else {
        updatedSession = await prisma.liveSession.update({
          where: { id: sessionId },
          data: { participantCount: newCount },
        });
      }
    }

    return NextResponse.json(updatedSession);
  } catch (err) {
    return serverError(err, "PATCH live session");
  }
}
