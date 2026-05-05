import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId, otp } = await req.json();

    const record = await prisma.emailVerification.findFirst({
      where: { userId, otp, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    await prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    const user = await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

    // Finalize Enrollment if Pending
    if (user.studentId) {
      const pending = await prisma.pendingStudent.findUnique({
        where: { studentId: user.studentId },
        include: { cohort: { include: { course: true } } } as any
      });

      if (pending) {
        await prisma.cohortEnrollment.upsert({
          where: { userId_cohortId: { userId, cohortId: pending.cohortId } },
          update: {},
          create: {
            userId,
            cohortId: pending.cohortId,
            amountPaid: pending.amountPaid,
            paymentStatus: pending.paymentStatus as any,
            reference: `REF-${pending.studentId}-${Date.now()}`,
            totalAmount: (pending as any).cohort.course.basePrice,
          }
        });

        await prisma.pendingStudent.delete({ where: { id: pending.id } }).catch(() => {});
      }
    }

    await createSession(userId, "student");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Student verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
