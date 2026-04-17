import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.password) {
      return NextResponse.json({ error: "No account found with that email" }, { status: 401 });
    }

    // Verify password — wrap in try/catch in case stored hash is malformed
    let valid = false;
    try {
      valid = verifyPassword(password, user.password);
    } catch {
      console.error("verifyPassword error — stored hash may be malformed for user:", email);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first", userId: user.id },
        { status: 403 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Student login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
