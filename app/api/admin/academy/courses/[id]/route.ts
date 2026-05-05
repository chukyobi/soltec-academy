
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
    const { 
      title, slug, description, level, duration, 
      price, basePrice, color, isProgramming,
      isActive 
    } = body;

    const course = await prisma.academyCourse.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        level,
        duration,
        price,
        basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
        color,
        isProgramming,
        isActive,
      },
    });

    return NextResponse.json(course);
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

    // Check if there are active cohorts before deleting
    const cohortCount = await prisma.cohort.count({ where: { courseId: id } });
    if (cohortCount > 0) {
      return NextResponse.json({ error: "Cannot delete track with existing cohorts. Freeze it instead." }, { status: 400 });
    }

    await prisma.academyCourse.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
