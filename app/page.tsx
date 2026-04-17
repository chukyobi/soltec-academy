
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { FrontGallery } from '@/components/frontGallery';
import { AcademyTracks } from '@/components/academy-tracks';
import { CTA } from '@/components/cta';
import { Blog } from '@/components/blog';
import { Testimonials } from '@/components/testimonials';
import { FAQ } from '@/components/faq';
import { Footer } from '@/components/footer';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const revalidate = 60;

export default async function Home() {
  const now = new Date();

  const [session, academyCourses, featuredPosts] = await Promise.all([
    getSession().catch(() => null),
    prisma.academyCourse.findMany({
      orderBy: { title: 'asc' },
      include: {
        cohorts: {
          orderBy: { startDate: 'asc' },
          include: { _count: { select: { enrollments: true } } },
        },
      },
    }),
    prisma.blogPost.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  // Annotate each course with its nearest cohort status
  const courses = academyCourses.map((course) => {
    const activeCohort = course.cohorts.find(
      (c) => c.startDate && c.startDate <= now && (!c.endDate || c.endDate >= now)
    );
    const upcomingCohort = course.cohorts
      .filter((c) => c.startDate && c.startDate > now)
      .sort((a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0))[0];

    const displayCohort = activeCohort ?? upcomingCohort ?? null;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      level: course.level,
      duration: course.duration,
      price: course.price,
      color: course.color,
      cohortStatus: activeCohort ? 'active' : upcomingCohort ? 'upcoming' : 'none',
      cohortStartDate: displayCohort?.startDate?.toISOString() ?? null,
      cohortEndDate: displayCohort?.endDate?.toISOString() ?? null,
      cohortId: displayCohort?.id ?? null,
      enrolledCount: displayCohort?._count.enrollments ?? 0,
      maxStudents: displayCohort?.maxStudents ?? 20,
      cohortName: displayCohort?.name ?? null,
      cohortPrice: displayCohort?.price ?? null,
    } as const;
  });

  const student = session?.user
    ? { name: session.user.name ?? '', email: session.user.email ?? '' }
    : null;

  return (
    <main className="min-h-screen">
      <Navbar student={student} />
      <Hero />
      <Features />
      <FrontGallery />
      <AcademyTracks courses={courses} />
      <CTA />
      <Blog posts={featuredPosts} />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
