import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId, otp } = await req.json();

    if (!userId || !otp) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Find the latest unused, non-expired OTP for this user
    const record = await prisma.emailVerification.findFirst({
      where: {
        userId,
        otp,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    // Mark used + set user as verified
    await prisma.$transaction([
      prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: userId }, data: { emailVerified: true } }),
    ]);

    // Start session
    await createSession(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
