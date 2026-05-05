import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import AcademyClient from "./AcademyClient";

export default async function AdminAcademyPage() {
  // Verify admin server-side — redirect if not authenticated
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  // Fetch all data directly from the database (no HTTP round-trip, no auth issues)
  const [courses, cohorts, tutorsRaw] = await Promise.all([
    prisma.academyCourse.findMany({
      include: { _count: { select: { cohorts: true } } },
      orderBy: { title: "asc" },
    }),

    prisma.cohort.findMany({
      include: {
        course: { select: { id: true, title: true, slug: true, color: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: "asc" },
    }),

    prisma.user.findMany({
      where: { role: "TUTOR" },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        isActive: true,
        managedCohorts: { select: { id: true } } 
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Enrich tutors with cohort count
  const tutors = tutorsRaw.map((t) => ({ 
    ...t, 
    cohortCount: t.managedCohorts.length 
  }));

  // Serialise dates to ISO strings for the client component
  const serialisedCohorts = cohorts.map((c) => ({
    ...c,
    startDate: c.startDate?.toISOString() ?? null,
    endDate: c.endDate?.toISOString() ?? null,
  }));

  return (
    <AcademyClient
      initialCourses={courses}
      initialCohorts={serialisedCohorts}
      initialTutors={tutors}
    />
  );
}
