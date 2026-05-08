import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession, generateOtp } from "@/lib/auth";
import { serverError } from "@/lib/api-error";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const identifier = (body?.identifier || body?.email || "").toLowerCase().trim();
    const password = body?.password;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/Student ID and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ 
      where: {
        OR: [
          { email: identifier },
          { studentId: { equals: identifier, mode: "insensitive" } }
        ]
      }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "No account found with that Email or Student ID" }, { status: 401 });
    }

    // Verify password — wrap in try/catch in case stored hash is malformed
    let valid = false;
    try {
      valid = verifyPassword(password, user.password);
    } catch {
      console.error("verifyPassword error — stored hash may be malformed for user:", identifier);
      return NextResponse.json({ error: "Sign-in failed. Please contact support if this keeps happening." }, { status: 401 });
    }

    if (!valid) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    if (!user.emailVerified) {
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

      return NextResponse.json(
        { 
          success: true,
          needsVerification: true, 
          userId: user.id,
          message: "Account not verified. A new verification code has been sent to your email." 
        },
        { status: 200 }
      );
    }

    await createSession(user.id, "student");

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return serverError(err, "Student login", "login");
  }
}
