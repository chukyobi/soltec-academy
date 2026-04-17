import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/academy/courses
export async function GET() {
  try {
    await requireAdmin();
    const courses = await prisma.academyCourse.findMany({
      include: { _count: { select: { cohorts: true } } },
      orderBy: { title: "asc" },
    });
    return NextResponse.json(courses);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/academy/courses – create a new track
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { title, slug, description, level, duration, price, color, isProgramming, instructorName, instructorRole } = body;

    if (!title || !slug || !description) {
      return NextResponse.json({ error: "title, slug, and description are required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.academyCourse.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
    }

    const course = await prisma.academyCourse.create({
      data: {
        title,
        slug,
        description,
        level: level ?? "Beginner",
        duration: duration ?? "3 Months",
        price: price ?? "NGN 100,000",
        color: color ?? "from-indigo-600 to-purple-600",
        isProgramming: isProgramming ?? false,
        instructorName: instructorName ?? null,
        instructorRole: instructorRole ?? null,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
