import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

// POST /api/tutor/auth/setup – Update password for new tutors
export async function POST(req: Request) {
  try {
    const session = await getSession("tutor").catch(() => null) as any;
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const hashedPassword = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        needsPasswordChange: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Tutor setup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
