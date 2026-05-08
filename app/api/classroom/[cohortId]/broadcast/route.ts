import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";

// POST /api/classroom/[cohortId]/broadcast
// Body: { title, message }
export async function POST(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null) as any;
    
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
    }

    const { title, message } = await req.json();
    if (!title || !message) return NextResponse.json({ error: "Title and message are required" }, { status: 400 });

    // 1. Get all students and tutors in this cohort
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        enrollments: { select: { userId: true } },
        tutors: { select: { id: true } },
      }
    });

    if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });

    const studentIds = cohort.enrollments.map(e => e.userId);
    const tutorIds = cohort.tutors.map(t => t.id);
    const allRecipientIds = [...new Set([...studentIds, ...tutorIds])];

    // 2. Create Personalized Notifications in DB
    const notifications = allRecipientIds.map(userId => {
      const isTutor = tutorIds.includes(userId);
      const isSelf = userId === session.userId;
      
      let finalMessage = message;
      let finalTitle = title;

      if (isSelf) {
        finalTitle = "Broadcast Started";
        finalMessage = `You have successfully sent a broadcast to ${studentIds.length} students.`;
      } else if (isTutor) {
        finalTitle = `[Tutor Alert] ${title}`;
        finalMessage = `${session.user.name} (Tutor) sent a broadcast: ${message}`;
      }

      return prisma.notification.create({
        data: {
          user: { connect: { id: userId } },
          type: "BROADCAST",
          title: finalTitle,
          message: finalMessage,
          metadata: { cohortId, senderId: session.userId }
        }
      });
    });

    await Promise.all(notifications);

    // 3. Trigger Real-time Pusher Alerts
    await pusherServer.trigger(`classroom-${cohortId}`, 'broadcast-received', {
      title,
      message,
      senderName: session.user.name
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, "POST broadcast");
  }
}
