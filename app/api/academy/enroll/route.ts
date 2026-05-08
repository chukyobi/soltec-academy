import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, createSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { sendEnrollmentEmail } from "@/lib/mail";
import crypto from "crypto";

// POST /api/academy/enroll
// Body: { cohortId, paymentType, reference?, email?, studentId?, isNew? }
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { cohortId, paymentType, reference: clientRef, email, studentId, isNew } = await req.json();

    if (!cohortId || !paymentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Identify/Verify User context
    let userId = session?.userId ?? null;

    // If studentId provided, try to find existing student
    if (!userId && studentId) {
      const user = await prisma.user.findUnique({ 
        where: { studentId } 
      });
      if (!user) {
        return NextResponse.json({ error: "Student ID not found. Please check and try again." }, { status: 404 });
      }
      userId = user.id;
    }

    if (!userId && (!email || !isNew)) {
      return NextResponse.json({ error: "Authentication, Email, or Student ID required" }, { status: 400 });
    }

    if (!userId && email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ 
          error: "This email is already registered. Please provide your Student ID to enroll.",
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
      return NextResponse.json({ error: "You're already enrolled in this cohort." }, { status: 409 });
    }

    const totalEnrolled = await prisma.cohortEnrollment.count({ where: { cohortId } });
    if (totalEnrolled >= cohort.maxStudents) {
      return NextResponse.json({ error: "This cohort is now full. Please choose another." }, { status: 409 });
    }

    const totalAmount = (cohort as any).course.basePrice;
    const amountPaid =
      paymentType === "FULL"
        ? totalAmount
        : (totalAmount * cohort.partPaymentPercent) / 100;
    const paymentStatus = paymentType === "FULL" ? "PAID" : "PARTIAL";

    const reference = clientRef ?? `demo_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    if (clientRef && process.env.PAYSTACK_SECRET_KEY) {
      try {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${clientRef}`, {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.status || verifyData.data.status !== "success") {
          return NextResponse.json({ error: "Payment verification failed or payment not successful." }, { status: 400 });
        }
      } catch (err) {
        return NextResponse.json({ error: "Failed to verify payment with Paystack." }, { status: 500 });
      }
    }

    if (userId) {
      // SIGNED IN OR IDENTIFIED BY ID: Create enrollment immediately
      const enrollment = await prisma.cohortEnrollment.create({
        data: {
          userId,
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
          message: `User enrolled in "${cohort.name}" (${paymentStatus}).`,
          metadata: { enrollmentId: enrollment.id, userId, cohortId },
        },
      }).catch(() => {});

      // If they weren't logged in but identified by ID, create a session now
      if (!session) {
        await createSession(userId, "student");
      }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
      if (user) {
        await sendEnrollmentEmail(
          user.email,
          user.name || "Student",
          cohort.name,
          `NGN ${amountPaid.toLocaleString()}`,
          reference
        ).catch(e => console.error("Enrollment email failed:", e));
      }

      return NextResponse.json({ success: true, redirect: "/student/profile" }, { status: 201 });
    } else {
      // NEW STUDENT: Generate ID and store in PendingStudent
      // Format: STU-SOL-XXXX-TEC (XXXX = random alphanumeric)
      // Use upsert so repeat attempts (same email) update rather than crash on unique constraint
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars (0,1,I,O)
      const random = Array.from(crypto.randomBytes(4))
        .map((b) => chars[b % chars.length])
        .join("");
      const newStudentId = `STU-SOL-${random}-TEC`;

      // Check if a pending record already exists for this email (re-enrollment attempt)
      const existingPending = await prisma.pendingStudent.findUnique({
        where: { email: email! },
      });

      // Reuse the existing student ID so the student always gets the same one
      const studentId = existingPending?.studentId ?? newStudentId;

      await prisma.pendingStudent.upsert({
        where: { email: email! },
        update: {
          cohortId,
          paymentStatus,
          amountPaid,
        },
        create: {
          email: email!,
          studentId,
          cohortId,
          paymentStatus,
          amountPaid,
        },
      });

      // Encrypt the payload
      const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "fallback_secret_key_123456789012";
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(SECRET_KEY.padEnd(32).slice(0, 32)), iv);
      let encrypted = cipher.update(JSON.stringify({ studentId, email }), "utf8", "hex");
      encrypted += cipher.final("hex");
      const authTag = cipher.getAuthTag().toString("hex");
      const enc = `${iv.toString("hex")}:${authTag}:${encrypted}`;

      await sendEnrollmentEmail(
        email!,
        "Student",
        cohort.name,
        `NGN ${amountPaid.toLocaleString()}`,
        reference
      ).catch(e => console.error("Enrollment email failed:", e));

      return NextResponse.json({ 
        success: true, 
        isNew: true, 
        studentId, 
        email,
        redirect: `/student/signup?enc=${enc}`
      }, { status: 201 });
    }
  } catch (err: unknown) {
    return serverError(err, "Enroll", "enroll");
  }
}
