import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

// POST /api/academy/enroll
// Body: { cohortId, paymentType: "FULL" | "PART", reference?, email?, isNew? }
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { cohortId, paymentType, reference: clientRef, email, isNew } = await req.json();

    if (!cohortId || !paymentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!session && (!email || !isNew)) {
      return NextResponse.json({ error: "Authentication or email required" }, { status: 400 });
    }

    // 1. Identify/Verify User context
    let userId = session?.userId ?? null;

    if (!session && email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ 
          error: "This email is already registered. Please sign in to enroll.",
          code: "AUTH_REQUIRED" 
        }, { status: 401 });
      }
    }

    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        course: true,
        enrollments: userId ? { where: { userId } } : false
      } as any,
    });

    if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });

    if (userId && (cohort as any).enrollments.length > 0) {
      return NextResponse.json({ error: "Already enrolled in this cohort" }, { status: 409 });
    }

    const totalEnrolled = await prisma.cohortEnrollment.count({ where: { cohortId } });
    if (totalEnrolled >= cohort.maxStudents) {
      return NextResponse.json({ error: "Cohort is full" }, { status: 409 });
    }

    const totalAmount = (cohort as any).course.basePrice;
    const amountPaid =
      paymentType === "FULL"
        ? totalAmount
        : (totalAmount * cohort.partPaymentPercent) / 100;
    const paymentStatus = paymentType === "FULL" ? "PAID" : "PARTIAL";

    const reference = clientRef ?? `demo_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    if (session) {
      // SIGNED IN: Create enrollment immediately
      const enrollment = await prisma.cohortEnrollment.create({
        data: {
          userId: session.userId,
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
          metadata: { enrollmentId: enrollment.id, userId: session.userId, cohortId },
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, redirect: "/student/profile" }, { status: 201 });
    } else {
      // NEW STUDENT: Generate ID and store in PendingStudent
      const year = new Date().getFullYear();
      const random = crypto.randomBytes(2).toString("hex").toUpperCase();
      const studentId = `STU-${year}-${random}`;

      await prisma.pendingStudent.create({
        data: {
          email: email!,
          studentId,
          cohortId,
          paymentStatus,
          amountPaid,
        },
      });

      return NextResponse.json({ 
        success: true, 
        isNew: true, 
        studentId, 
        email,
        redirect: `/student/signup?studentId=${studentId}&email=${email}`
      }, { status: 201 });
    }
  } catch (err: unknown) {
    console.error("Enroll error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
