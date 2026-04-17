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
    await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

    await createSession(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Student verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
