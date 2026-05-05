import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.password || !body?.name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const { name, email, password } = body;
    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: true, // Auto-verify for admin setup
      },
    });

    await createSession(user.id, "admin");

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Admin signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
