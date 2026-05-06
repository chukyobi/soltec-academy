import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

// GET classroom settings
export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const settings = await prisma.classroomSettings.findUnique({ where: { cohortId } });
    return NextResponse.json(settings ?? {});
  } catch (err) {
    return serverError(err, "GET classroom settings");
  }
}

// PATCH — tutor updates settings
export async function PATCH(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const session = await getSession("tutor").catch(() => null);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Tutor access required" }, { status: 403 });
    }

    const body = await req.json();
    const settings = await prisma.classroomSettings.upsert({
      where: { cohortId },
      update: body,
      create: { cohortId, ...body },
    });
    return NextResponse.json(settings);
  } catch (err) {
    return serverError(err, "PATCH classroom settings");
  }
}
