import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateOtp, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name ?? email.split("@")[0], role: "STUDENT" },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    await prisma.emailVerification.create({ data: { userId: user.id, otp, expiresAt } });

    // In production: send OTP via email. Dev: return in response.
    const devOtp = process.env.NODE_ENV !== "production" ? otp : undefined;

    return NextResponse.json({ success: true, userId: user.id, devOtp }, { status: 201 });
  } catch (err) {
    console.error("Student signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
