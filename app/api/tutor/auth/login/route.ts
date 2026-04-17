import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

// POST /api/tutor/auth/login
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "TUTOR") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (!user.password) {
      return NextResponse.json({ error: "Account not set up for password login" }, { status: 401 });
    }
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Tutor login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
