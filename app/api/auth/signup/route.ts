import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateOtp, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, password: hashed, role: "CREATOR", emailVerified: false },
    });

    // Generate 6-digit OTP (15-minute expiry)
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.emailVerification.create({ data: { userId: user.id, otp, expiresAt } });

    // In production: send email with otp
    // For now: return otp in dev mode only
    const devOtp = process.env.NODE_ENV !== "production" ? otp : undefined;
    console.log(`[DEV] Email verification OTP for ${email}: ${otp}`);

    return NextResponse.json({ success: true, userId: user.id, devOtp }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
