import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

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
      return NextResponse.json(
        { error: "Please verify your email before signing in.", userId: user.id },
        { status: 403 }
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
