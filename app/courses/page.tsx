import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import CoursesMarketplaceClient from "./CoursesMarketplaceClient";

export const revalidate = 60;

export default async function CoursesPage() {
  const [session, courses] = await Promise.all([
    getSession().catch(() => null),
    prisma.creatorCourse.findMany({
      where: { status: "APPROVED" },
      include: {
        creator: {
          select: { name: true, image: true, creatorProfile: true }
        },
        _count: { select: { videos: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const student = session?.user
    ? { name: session.user.name ?? "", email: session.user.email ?? "" }
    : null;

  // Map courses to match the client component's expected structure
  const mappedCourses = courses.map(c => ({
    ...c,
    creator: {
      user: {
        name: (c.creator as any).name,
        image: (c.creator as any).image
      },
      profile: (c.creator as any).creatorProfile
    }
  }));

  return (
    <main className="min-h-screen bg-[#09090f]">
      <Navbar theme="dark" student={student} />
      <CoursesMarketplaceClient initialCourses={mappedCourses} />
      <Footer />
    </main>
  );
}
