import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// GET messages for a classroom
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession().catch(() => null) ?? await getSession("tutor").catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const messages = await (prisma.classroomMessage as any).findMany({
      where: { cohortId },
      include: { 
        user: { select: { id: true, name: true, role: true, studentId: true, image: true } },
        mentions: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return NextResponse.json(messages);
  } catch (err) {
    return serverError(err, "GET classroom messages");
  }
}

// POST — send a message
export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession().catch(() => null) ?? await getSession("tutor").catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, mentions } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

    const message = await (prisma.classroomMessage as any).create({
      data: { 
        cohortId, 
        userId: session.userId, 
        content: content.trim(),
        mentions: mentions && mentions.length > 0 ? {
          connect: mentions.map((id: string) => ({ id }))
        } : undefined
      },
      include: { 
        user: { select: { id: true, name: true, role: true, studentId: true, image: true } },
        mentions: { select: { id: true, name: true } }
      },
    });

    // ── Trigger Pusher Event ──────────────────────────────────────────────────
    try {
      await pusherServer.trigger(`classroom-${cohortId}`, 'new-message', message);
      
      // If there are mentions, trigger notification events for those users
      if (mentions && mentions.length > 0) {
        for (const targetId of mentions) {
          await pusherServer.trigger(`user-${targetId}`, 'mention-notification', {
            from: session.user.name,
            content: content.trim(),
            cohortId
          });
        }
      }
    } catch (pErr) {
      console.error("Pusher Trigger Failed:", pErr);
      // Don't fail the request if Pusher is down or misconfigured
    }

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    return serverError(err, "POST classroom message");
  }
}
