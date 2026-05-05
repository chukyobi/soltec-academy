import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { field } = await req.json();

    if (field !== "hasSeenWelcome" && field !== "hasSeenTour") {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { [field]: true }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
