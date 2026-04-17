import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";
import crypto from "crypto";

// POST /api/academy/enroll
// Body: { cohortId, paymentType: "FULL" | "PART", reference? }
// In demo mode (no Paystack), reference is auto-generated if omitted
export async function POST(req: Request) {
  try {
    const session = await requireStudent();
    const { cohortId, paymentType, reference: clientRef } = await req.json();

    if (!cohortId || !paymentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { enrollments: { where: { userId: session.user.id } } },
    });

    if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });

    if (cohort.enrollments.length > 0) {
      return NextResponse.json({ error: "Already enrolled in this cohort" }, { status: 409 });
    }

    const totalEnrolled = await prisma.cohortEnrollment.count({ where: { cohortId } });
    if (totalEnrolled >= cohort.maxStudents) {
      return NextResponse.json({ error: "Cohort is full" }, { status: 409 });
    }

    const totalAmount = cohort.price;
    const amountPaid =
      paymentType === "FULL"
        ? totalAmount
        : (totalAmount * cohort.partPaymentPercent) / 100;
    const paymentStatus = paymentType === "FULL" ? "PAID" : "PARTIAL";

    // Generate reference if not provided (demo mode)
    const reference = clientRef ?? `demo_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const enrollment = await prisma.cohortEnrollment.create({
      data: {
        userId: session.user.id,
        cohortId,
        totalAmount,
        amountPaid,
        paymentStatus,
        reference,
      },
    });

    await prisma.notification.create({
      data: {
        type: "NEW_ENROLLMENT",
        title: "New Academy Enrollment",
        message: `${session.user.name ?? session.user.email} enrolled in "${cohort.name}" (${paymentStatus}).`,
        metadata: { enrollmentId: enrollment.id, userId: session.user.id, cohortId },
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, enrollment }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Please sign in to enroll" }, { status: 401 });
    console.error("Enroll error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
