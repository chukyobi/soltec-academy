import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AcademyHero } from "@/components/academy-hero";
import { ArrowRight, Star, Zap } from "lucide-react";
import {
  FiBarChart2, FiCode, FiDatabase, FiClock, FiZap,
} from "react-icons/fi";
import { MdOutlineDesignServices, MdOutlineComputer } from "react-icons/md";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

const COURSE_META: Record<string, {
  gradient: string; tag: string; outcomes: string[];
}> = {
  "product-design":   { gradient: "from-rose-500 via-pink-500 to-fuchsia-600",   tag: "Design",      outcomes: ["Figma mastery", "Design Systems", "Prototyping", "User Research"] },
  "ui-ux-design":     { gradient: "from-violet-600 via-purple-600 to-indigo-600", tag: "Design",      outcomes: ["UX Research", "Wireframing", "Usability Testing", "UI Principles"] },
  "data-analysis":    { gradient: "from-amber-500 via-orange-500 to-red-500",     tag: "Data",        outcomes: ["Excel & SQL", "Python Basics", "Data Visualization", "Dashboards"] },
  "frontend-web-dev": { gradient: "from-cyan-500 via-sky-500 to-blue-600",        tag: "Engineering", outcomes: ["HTML/CSS/JS", "React", "Responsive Design", "Git & Deploy"] },
  "backend-web-dev":  { gradient: "from-emerald-500 via-teal-500 to-green-600",   tag: "Engineering", outcomes: ["Node.js", "REST APIs", "Databases", "Auth & Security"] },
};

const FALLBACK_META = { gradient: "from-slate-600 to-slate-700", tag: "Course", outcomes: [] };

const FEATURES = [
  { icon: "🎓", title: "Expert Mentors", desc: "Seasoned professionals with real industry experience guide every cohort session." },
  { icon: "📋", title: "Industry Curriculum", desc: "Syllabus aligned with what top companies hire for — built from real job postings." },
  { icon: "🖥️", title: "Live Bootcamp Format", desc: "Structured weekly sessions, deadlines & peer accountability — not just passive videos." },
  { icon: "🌐", title: "Networking & Community", desc: "Join a tight-knit class of peers and tap into the Soltec alumni network." },
  { icon: "📜", title: "Certificate", desc: "Industry-recognised certificate upon completing your cohort and capstone project." },
  { icon: "💼", title: "Career Support", desc: "CV reviews, portfolio feedback, and direct introductions to hiring partners." },
];

const HOW_IT_WORKS = [
  { step: "01", cartoon: "🎯", title: "Pick Your Track", desc: "Choose from 5 high-demand skill tracks — design, code, or data." },
  { step: "02", cartoon: "📅", title: "Join a Cohort", desc: "Select cohort dates that work for you — max 20 seats per class." },
  { step: "03", cartoon: "💳", title: "Secure Your Spot", desc: "Pay in full or split 50/50. Your seat is confirmed immediately." },
  { step: "04", cartoon: "🚀", title: "Show Up & Graduate", desc: "Attend live classes, submit projects, and earn your certificate." },
];

const SLUG_ICONS: Record<string, React.ElementType> = {
  "product-design": MdOutlineDesignServices,
  "ui-ux-design": MdOutlineComputer,
  "data-analysis": FiBarChart2,
  "frontend-web-dev": FiCode,
  "backend-web-dev": FiDatabase,
};

function fmtDate(d: Date | null) {
  if (!d) return "TBD";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AcademyPage() {
  const now = new Date();

  const [session, courses] = await Promise.all([
    getSession().catch(() => null),
    prisma.academyCourse.findMany({
      include: {
        cohorts: {
          orderBy: { startDate: "asc" },
          include: { _count: { select: { enrollments: true } } },
        },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const activeCohortCount = courses.reduce(
    (a, c) => a + c.cohorts.filter((ch) => ch.startDate && ch.startDate <= now && (!ch.endDate || ch.endDate >= now)).length,
    0
  );

  const student = session?.user
    ? { name: session.user.name ?? "", email: session.user.email ?? "" }
    : null;

  return (
    <main className="min-h-screen bg-[#09090f]">
      <Navbar theme="dark" student={student} />

      {/* Hero — client component for animations */}
      <AcademyHero activeCohortCount={activeCohortCount} courseCount={courses.length} />

      {/* ══════════════ COURSES ══════════════ */}
      <section id="courses" className="py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">5 Tracks</p>
            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight">
              Choose your <span className="text-indigo-600">track</span>
            </h2>
            <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
              Every track runs for 3 months with live weekly classes, mentor support, and a real capstone project.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const meta = COURSE_META[course.slug] ?? FALLBACK_META;
              const Icon = SLUG_ICONS[course.slug] ?? FiCode;
              const activeCohort = course.cohorts.find(
                (c) => c.startDate && c.startDate <= now && (!c.endDate || c.endDate >= now)
              );
              const upcoming = course.cohorts.find((c) => c.startDate && c.startDate > now);
              const displayCohort = activeCohort ?? upcoming;

              return (
                <Link
                  key={course.id}
                  href={`/academy/${course.slug}`}
                  className="group relative rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col min-h-[400px]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-black/10 rounded-full" />

                  {activeCohort ? (
                    <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live Now
                    </div>
                  ) : upcoming ? (
                    <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                      <FiZap className="w-3 h-3" /> Coming Soon
                    </div>
                  ) : null}

                  <div className="relative z-10 p-8 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <span className="bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        {meta.tag}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">{course.level}</p>
                      <h3 className="text-2xl font-black text-white leading-tight mb-3">{course.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-5">{course.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {meta.outcomes.slice(0, 3).map((o) => (
                          <span key={o} className="bg-white/10 border border-white/15 text-white/80 text-xs px-2.5 py-1 rounded-lg font-medium">
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-4 mt-5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/70 text-xs font-bold">
                            <FiClock className="w-3 h-3" /> {course.duration}
                          </div>
                          {displayCohort && (
                            <div className="text-white/70 text-xs">
                              {activeCohort ? `Ends ${fmtDate(displayCohort.endDate)}` : `Starts ${fmtDate(displayCohort.startDate)}`}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-white font-black text-sm group-hover:gap-3 transition-all">
                          View & Enroll <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {courses.length < 6 && courses.length % 3 !== 0 && (
              <div className="hidden lg:flex relative rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 items-center justify-center min-h-[400px]">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">🚀</div>
                  <p className="font-black text-slate-400 text-lg">More tracks coming</p>
                  <p className="text-slate-300 text-sm mt-1">Stay tuned</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">Simple Process</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900">
              From zero to enrolled<br />in 4 steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />
            {HOW_IT_WORKS.map(({ step, cartoon, title, desc }, i) => (
              <div key={step} className={`relative bg-white rounded-3xl p-7 shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all hover:-translate-y-1`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 ${
                  i === 0 ? "bg-rose-50" : i === 1 ? "bg-purple-50" : i === 2 ? "bg-blue-50" : "bg-green-50"
                }`}>{cartoon}</div>
                <span className="absolute top-6 right-6 text-xs font-black text-slate-200">{step}</span>
                <h3 className="font-black text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="py-28 px-4 sm:px-6 bg-[#09090f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Why Academy Works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Everything you need<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">to actually succeed</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all group hover:-translate-y-1">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{icon}</div>
                <h3 className="text-white font-black text-lg mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIAL ══════════════ */}
      <section className="py-16 px-4 sm:px-6 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
            <span className="ml-2 text-slate-600 font-bold text-sm">5.0 from cohort graduates</span>
          </div>
          <p className="text-slate-500 text-sm max-w-lg text-center sm:text-left">
            &ldquo;Soltec Academy gave me the structure I needed. I landed a frontend role 2 months after graduating.&rdquo;
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">A</div>
            <div>
              <p className="font-black text-slate-900 text-sm">Adaeze N.</p>
              <p className="text-slate-400 text-xs">Frontend Developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-28 px-4 sm:px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-white/80 text-xs font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> Limited seats per cohort
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">Ready to level up?</h2>
          <p className="text-indigo-100/80 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Pick a track, join the next cohort, and start building skills that matter. Seats fill fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#courses" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-700 font-black text-lg rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl hover:-translate-y-0.5">
              Browse Tracks <ArrowRight className="w-5 h-5" />
            </a>
            <Link href="/student/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white font-black text-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
