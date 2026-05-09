import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { creatorProfile: true }
    });

    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password || "");
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Use creator-specific session
    await createSession(user.id, "creator");

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return serverError(err, "POST creator login");
  }
}
