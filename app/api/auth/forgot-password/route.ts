import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Since all users (Student, Tutor, Admin) are in the User model with different roles
    const user = await prisma.user.findFirst({
      where: { 
        email,
        role: role.toUpperCase() as any
      }
    });

    if (!user) {
      // Return success even if user not found for security (don't reveal if email exists)
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      }
    });

    await sendPasswordResetEmail(email, user.name || email.split("@")[0], resetToken, role.toLowerCase());

    return NextResponse.json({ success: true, message: "Reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
