import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverError } from "@/lib/api-error";

export async function GET() {
  try {
    const courses = await prisma.creatorCourse.findMany({
      where: { status: "APPROVED" },
      include: {
        creator: {
          select: { name: true, image: true, creatorProfile: true }
        },
        _count: { select: { videos: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Fix the mapping since User and CreatorProfile are separate in my schema
    const mapped = courses.map(c => ({
      ...c,
      creator: {
        user: {
          name: (c.creator as any).name,
          image: (c.creator as any).image,
        },
        profile: (c.creator as any).creatorProfile
      }
    }));

    return NextResponse.json({ courses: mapped });
  } catch (err) {
    return serverError(err, "GET marketplace courses");
  }
}
