import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// POST /api/classroom/[cohortId]/messages/[messageId]/react
// Body: { emoji, type: "classroom" | "live" }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ cohortId: string; messageId: string }> }
) {
  try {
    const { cohortId, messageId } = await params;
    const session = await getSession().catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { emoji, type } = await req.json();
    if (!emoji) return NextResponse.json({ error: "Emoji required" }, { status: 400 });

    const userId = session.userId;

    // Check if reaction already exists
    const where = type === "classroom" 
      ? { userId_messageId_emoji: { userId, messageId, emoji } }
      : { userId_liveMsgId_emoji: { userId, liveMsgId: messageId, emoji } };

    const existing = await prisma.messageReaction.findUnique({ where });

    if (existing) {
      // Remove reaction (toggle)
      await prisma.messageReaction.delete({ where: { id: existing.id } });
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          emoji,
          userId,
          messageId: type === "classroom" ? messageId : undefined,
          liveMsgId: type === "live" ? messageId : undefined,
        }
      });
    }

    // Get updated counts for this message
    const reactions = await prisma.messageReaction.findMany({
      where: {
        messageId: type === "classroom" ? messageId : undefined,
        liveMsgId: type === "live" ? messageId : undefined,
      },
      select: { emoji: true, userId: true }
    });

    // Group by emoji
    const counts = reactions.reduce((acc: any, r: { emoji: string; userId: string }) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    // Broadcast update
    await pusherServer.trigger(`classroom-${cohortId}`, 'reaction-updated', {
      messageId,
      type,
      counts,
      latestEmoji: emoji
    });

    return NextResponse.json({ success: true, counts });
  } catch (err) {
    return serverError(err, "POST reaction");
  }
}
