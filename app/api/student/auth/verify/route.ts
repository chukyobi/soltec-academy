import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const { userId, otp } = await req.json();

    const record = await prisma.emailVerification.findFirst({
      where: { userId, otp, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!record) {
      return NextResponse.json({
        error: "That code is invalid or has expired. Please go back and request a new one."
      }, { status: 400 });
    }

    await prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    const user = await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

    // Finalize Enrollment if Pending
    if (user.studentId) {
      // PendingStudent has no relation — fetch cohort separately
      const pending = await prisma.pendingStudent.findUnique({
        where: { studentId: user.studentId },
      });

      if (pending) {
        // Get the course price via the cohort relation
        const cohort = await prisma.cohort.findUnique({
          where: { id: pending.cohortId },
          include: { course: { select: { basePrice: true } } },
        });

        if (cohort) {
          await prisma.cohortEnrollment.upsert({
            where: { userId_cohortId: { userId, cohortId: pending.cohortId } },
            update: {},
            create: {
              userId,
              cohortId: pending.cohortId,
              amountPaid: pending.amountPaid,
              paymentStatus: pending.paymentStatus as any,
              reference: `REF-${pending.studentId}-${Date.now()}`,
              totalAmount: cohort.course.basePrice,
            },
          });
        }

        await prisma.pendingStudent.delete({ where: { id: pending.id } }).catch(() => {});
      }
    }

    await createSession(userId, "student");

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, "Student verify", "verify");
  }
}
