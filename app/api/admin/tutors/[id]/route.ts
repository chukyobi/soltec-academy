
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession("admin").catch(() => null);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const user = await prisma.user.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession("admin").catch(() => null);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if managing active cohorts
    const cohortCount = await prisma.cohort.count({
      where: { tutors: { some: { id } } }
    });
    
    if (cohortCount > 0) {
      return NextResponse.json({ error: "Cannot delete tutor with assigned cohorts. Freeze them instead." }, { status: 400 });
    }

    // Use deleteMany to avoid throwing if record doesn't exist (returns count: 0)
    const { count } = await prisma.user.deleteMany({ 
      where: { id, role: "TUTOR" } 
    });

    if (count === 0) {
      return NextResponse.json({ error: "Tutor not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TUTOR_DELETE]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
