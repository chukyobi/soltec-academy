import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Clock, Users, Award, CheckCircle2, BookOpen,
  Code2, Database, BarChart2, Layers, MonitorSmartphone,
  GraduationCap, ArrowLeft,
} from "lucide-react";
import CohortEnrollCard from "./CohortEnrollCard";
import Link from "next/link";

export const revalidate = 60;

const COURSE_META: Record<string, {
  icon: React.ElementType;
  gradient: string;
  lightBg: string;
  accent: string;
  outcomes: string[];
}> = {
  "product-design": {
    icon: Layers,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    lightBg: "bg-rose-50",
    accent: "text-rose-600",
    outcomes: ["Design and prototype in Figma", "Build scalable design systems", "Conduct user research sessions", "Create high-fidelity mockups", "Run usability tests", "Present design rationale to stakeholders"],
  },
  "ui-ux-design": {
    icon: MonitorSmartphone,
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    lightBg: "bg-violet-50",
    accent: "text-violet-600",
    outcomes: ["Map end-to-end user journeys", "Build wireframes and prototypes", "Apply UX heuristics and principles", "Conduct A/B tests and analyse results", "Create design portfolios", "Collaborate with cross-functional teams"],
  },
  "data-analysis": {
    icon: BarChart2,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    lightBg: "bg-amber-50",
    accent: "text-amber-600",
    outcomes: ["Excel power tools and pivot tables", "SQL for data querying", "Python basics for analysis", "Build interactive dashboards", "Statistical thinking for business", "Tell data stories with charts"],
  },
  "frontend-web-dev": {
    icon: Code2,
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    lightBg: "bg-sky-50",
    accent: "text-sky-600",
    outcomes: ["Master HTML, CSS, and JavaScript", "Build responsive layouts", "React components and hooks", "Fetch APIs and manage state", "Deploy projects to the web", "Version control with Git & GitHub"],
  },
  "backend-web-dev": {
    icon: Database,
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    lightBg: "bg-emerald-50",
    accent: "text-emerald-600",
    outcomes: ["Build REST APIs with Node.js", "Design and query databases", "Authentication & JWT", "Handle file uploads & storage", "Write tests for backend code", "Deploy servers to the cloud"],
  },
};

const FALLBACK_META = {
  icon: GraduationCap,
  gradient: "from-slate-600 to-slate-700",
  lightBg: "bg-slate-50",
  accent: "text-slate-600",
  outcomes: [],
};

export async function generateStaticParams() {
  const courses = await prisma.academyCourse.findMany({ select: { slug: true } });
  return courses.map((c) => ({ slug: c.slug }));
}

export default async function AcademyCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await prisma.academyCourse.findUnique({
    where: { slug },
    include: {
      cohorts: {
        include: { _count: { select: { enrollments: true } } },
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!course) notFound();

  const session = await getSession().catch(() => null);

  const meta = COURSE_META[course.slug] ?? FALLBACK_META;
  const Icon = meta.icon;

  // Parse curriculum modules
  const modules = Array.isArray(course.modules)
    ? (course.modules as { id: string; title: string; videos: { id: string; title: string; duration: string; isFree: boolean }[] }[])
    : [];

  // Build "what you'll learn" from meta outcomes > module videos fallback
  const outcomes = meta.outcomes.length > 0
    ? meta.outcomes
    : modules
        .flatMap((m) => m.videos.slice(0, 2).map((v) => v.title))
        .slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar theme="light" />

      {/* ── Hero ── */}
      <section className={`pt-28 pb-0 px-4 sm:px-6 bg-gradient-to-br ${meta.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-16 w-64 h-64 bg-black/10 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back link */}
          <Link href="/academy" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-bold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Tracks
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 items-end pb-16">
            <div className="flex-1">
              {/* Icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-white" />
              </div>

              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3 py-1 rounded-full text-white/80 text-xs font-black uppercase tracking-widest mb-4">
                {course.level}
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4">{course.title}</h1>
              <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-2xl">{course.description}</p>

              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-white text-sm font-bold">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-white text-sm font-bold">
                  <Users className="w-4 h-4" /> Max 20 students/cohort
                </span>
                <span className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-white text-sm font-bold">
                  <Award className="w-4 h-4" /> Certificate included
                </span>
              </div>
            </div>

            {/* Instructor card */}
            {course.instructorName && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 w-64 shrink-0 mb-0">
                <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-3">Lead Instructor</p>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 mb-3 flex items-center justify-center">
                  {course.instructorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.instructorAvatar} alt={course.instructorName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-white">{course.instructorName[0]}</span>
                  )}
                </div>
                <p className="font-black text-white">{course.instructorName}</p>
                <p className="text-white/60 text-xs mt-1">{course.instructorRole}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">

          {/* ── Left: Content ── */}
          <div className="lg:col-span-2 space-y-12">

            {/* What you'll learn */}
            {outcomes.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  What you&apos;ll learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {outcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full ${meta.lightBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${meta.accent}`} />
                      </div>
                      <span className="text-slate-700 text-sm leading-snug font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {modules.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-500" />
                  Curriculum
                  <span className="text-slate-400 text-base font-bold ml-1">({modules.length} modules)</span>
                </h2>
                <div className="space-y-3">
                  {modules.map((mod, mi) => (
                    <details key={mod.id} className="group rounded-2xl border border-slate-100 overflow-hidden">
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition-colors list-none">
                        <div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Module {mi + 1}</span>
                          <p className="font-bold text-slate-900">{mod.title}</p>
                        </div>
                        <span className="text-slate-400 text-xs font-bold shrink-0 ml-3">{mod.videos.length} lessons</span>
                      </summary>
                      <ul className="px-6 pb-4 space-y-2 border-t border-slate-100 pt-3 bg-white">
                        {mod.videos.map((v) => (
                          <li key={v.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <BookOpen className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              {v.title}
                              {v.isFree && <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">Free</span>}
                            </div>
                            <span className="text-slate-400 text-xs shrink-0 ml-3">{v.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Academy Promise */}
            <div className={`rounded-3xl p-8 border ${meta.lightBg} border-slate-100`}>
              <h3 className="font-black text-slate-900 text-xl mb-5">The Academy Promise</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Live weekly sessions with your assigned tutor",
                  "Real-world capstone project for your portfolio",
                  "Peer cohort — you grow together, not alone",
                  "Industry-recognised certificate on completion",
                  "Career support & alumni network access",
                  "Dedicated support channel for all questions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-slate-700 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${meta.accent} shrink-0 mt-0.5`} />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Enroll Card ── */}
          <div className="lg:col-span-1">
            <CohortEnrollCard
              course={{ id: course.id, title: course.title, slug: course.slug, price: course.price }}
              cohorts={course.cohorts.map((c) => ({
                id: c.id,
                name: c.name,
                tutorName: c.tutorName,
                startDate: c.startDate?.toISOString() ?? null,
                endDate: c.endDate?.toISOString() ?? null,
                maxStudents: c.maxStudents,
                price: c.price,
                partPaymentEnabled: c.partPaymentEnabled,
                partPaymentPercent: c.partPaymentPercent,
                enrolledCount: c._count.enrollments,
              }))}
              userId={session?.user.id ?? null}
              userEmail={session?.user.email ?? null}
              gradient={meta.gradient}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
