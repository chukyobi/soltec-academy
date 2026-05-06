import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateOtp } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const { email, password, name, studentId } = await req.json();

    if (!email || !password || !studentId) {
      return NextResponse.json({ error: "Email, password, and Student ID are required" }, { status: 400 });
    }

    // 1. Verify Student ID and Email against PendingStudent
    const pending = await prisma.pendingStudent.findUnique({
      where: { studentId }
    });

    if (!pending || pending.email !== email) {
      return NextResponse.json({
        error: "We couldn't verify your Student ID or email. Please ensure you've completed your track payment and are using the correct details."
      }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({
        error: "An account with this email already exists. Please sign in instead."
      }, { status: 409 });
    }

    const hashed = hashPassword(password);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashed, 
        name: name ?? email.split("@")[0], 
        role: "STUDENT",
        studentId,
      },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    await prisma.emailVerification.create({ data: { userId: user.id, otp, expiresAt } });

    // TODO: In production, send OTP via email mailer (currently always returned for display)
    return NextResponse.json({ success: true, userId: user.id, devOtp: otp }, { status: 201 });
  } catch (err) {
    return serverError(err, "Student signup", "signup");
  }
}
