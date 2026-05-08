import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getSession("creator").catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.userId }
    });

    return NextResponse.json({ profile });
  } catch (err) {
    return serverError(err, "GET creator profile");
  }
}
