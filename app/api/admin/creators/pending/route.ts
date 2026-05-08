import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serverError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getSession("admin").catch(() => null) as any;
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creators = await prisma.creatorProfile.findMany({
      where: { approvalStatus: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ creators });
  } catch (err) {
    return serverError(err, "GET pending creators");
  }
}
