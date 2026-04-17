import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        cohortEnrollments: {
          include: {
            cohort: {
              include: { course: { select: { title: true, slug: true, color: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        enrollments: {
          include: {
            course: { select: { id: true, title: true, price: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cohortEnrollments: user.cohortEnrollments,
      courseEnrollments: user.enrollments,
    });
  } catch (err) {
    console.error("Profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
