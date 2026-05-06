import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "Image URL required" }, { status: 400 });

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { image }
    });

    return NextResponse.json(user);
  } catch (err) {
    return serverError(err, "POST profile image");
  }
}
