import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    // Update or create verification record
    await prisma.emailVerification.upsert({
      where: { id: (await prisma.emailVerification.findFirst({ where: { userId: user.id } }))?.id ?? 'new' },
      update: { otp, expiresAt, usedAt: null },
      create: { userId: user.id, otp, expiresAt }
    });

    await sendOtpEmail(user.email, user.name || user.email.split("@")[0], otp);

    return NextResponse.json({ success: true, message: "A new verification code has been sent." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Failed to resend code" }, { status: 500 });
  }
}
