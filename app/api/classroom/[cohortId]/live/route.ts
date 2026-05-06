import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isLive } = await req.json();
    
    // In a real app, you'd generate a LiveKit token here and room ID
    const liveRoomId = isLive ? `room-${cohortId}-${Date.now()}` : null;

    const cohort = await (prisma.cohort as any).update({
      where: { id: cohortId },
      data: { isLive, liveRoomId }
    });

    // Create a system message in the chat
    await (prisma.classroomMessage as any).create({
      data: {
        cohortId,
        userId: session.userId,
        content: isLive ? "🔴 Live Class has started! Click 'Join Live' to enter." : "⚪ Live Class has ended.",
      }
    });

    return NextResponse.json(cohort);
  } catch (err) {
    return serverError(err, "POST live state");
  }
}
