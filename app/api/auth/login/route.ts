import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (!user.emailVerified) {
      return NextResponse.json({ error: "Email not verified", userId: user.id }, { status: 403 });
    }
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (user.role !== "CREATOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not a creator account" }, { status: 403 });
    }

    await createSession(user.id);

    const profile = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ success: true, needsOnboarding: !profile });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
