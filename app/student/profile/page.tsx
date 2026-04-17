import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  GraduationCap, LogOut, ArrowRight, CheckCircle2,
  AlertCircle, Clock, BookOpen, Users, CalendarDays,
  Layers, BarChart2, Code2, Database, MonitorSmartphone,
  Award, ChevronRight
} from "lucide-react";

export const revalidate = 0;

const SLUG_ICONS: Record<string, React.ElementType> = {
  "product-design": Layers,
  "ui-ux-design": MonitorSmartphone,
  "data-analysis": BarChart2,
  "frontend-web-dev": Code2,
  "backend-web-dev": Database,
};

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ElementType; label: string }> = {
  PAID: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", icon: CheckCircle2, label: "Fully Paid" },
  PARTIAL: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: AlertCircle, label: "Part Paid" },
  UNPAID: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: Clock, label: "Unpaid" },
};

function fmtDate(d: Date | null) {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtNGN(n: number) { return `₦${n.toLocaleString("en-NG")}`; }

export default async function StudentProfilePage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/student/login?redirect=/student/profile");

  // Fetch all cohort enrollments for this student
  const enrollments = await prisma.cohortEnrollment.findMany({
    where: { userId: session.user.id },
    include: {
      cohort: {
        include: {
          course: { select: { id: true, title: true, slug: true, color: true, level: true, duration: true } },
          _count: { select: { enrollments: true, assignments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = enrollments.reduce((s, e) => s + (e.amountPaid ?? 0), 0);
  const fullyPaid = enrollments.filter(e => e.paymentStatus === "PAID").length;
  const partial = enrollments.filter(e => e.paymentStatus === "PARTIAL").length;

  return (
    <div className="min-h-screen bg-[#09090f]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#09090f]/80 backdrop-blur border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-sm hidden sm:block">Soltec Academy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/academy" className="text-slate-400 hover:text-white text-xs font-bold hidden sm:block transition-colors">
              Browse Tracks →
            </Link>
            <Link href="/api/student/auth/logout" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Hero */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0">
            {(session.user.name ?? session.user.email ?? "S")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {session.user.name ?? "Student"}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">{session.user.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Student</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tracks Enrolled", value: enrollments.length, icon: GraduationCap, color: "from-indigo-500 to-purple-600" },
            { label: "Fully Paid", value: fullyPaid, icon: CheckCircle2, color: "from-green-500 to-emerald-600" },
            { label: "Part Paid", value: partial, icon: AlertCircle, color: "from-amber-500 to-orange-600" },
            { label: "Total Paid", value: fmtNGN(totalPaid), icon: Award, color: "from-teal-500 to-cyan-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white font-black text-xl leading-tight">{value}</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Enrolled tracks */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-white">My Tracks</h2>
            <Link href="/academy" className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
              Browse more <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-14 text-center">
              <GraduationCap className="w-14 h-14 text-slate-700 mx-auto mb-4" />
              <h3 className="text-white font-black text-xl mb-2">No tracks yet</h3>
              <p className="text-slate-400 text-sm mb-6">
                Enroll in a cohort track to start your learning journey.
              </p>
              <Link href="/academy" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl hover:opacity-90 transition-all">
                Browse Academy <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrollments.map(enrollment => {
                const cohort = enrollment.cohort;
                const course = cohort.course;
                const Icon = SLUG_ICONS[course.slug] ?? BookOpen;
                const status = STATUS_STYLES[enrollment.paymentStatus] ?? STATUS_STYLES.UNPAID;
                const StatusIcon = status.icon;
                const balance = (enrollment.totalAmount ?? 0) - (enrollment.amountPaid ?? 0);

                return (
                  <div key={enrollment.id} className="bg-white/[0.04] border border-white/[0.07] rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-all">
                    {/* Card header with gradient */}
                    <div className={`bg-gradient-to-br ${course.color} p-5 relative`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative flex items-start justify-between">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`flex items-center gap-1.5 ${status.bg} ${status.text} border ${status.border} text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="relative mt-3">
                        <h3 className="text-white font-black text-lg leading-tight">{course.title}</h3>
                        <p className="text-white/70 text-sm mt-0.5">{cohort.name}</p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> {fmtDate(cohort.startDate)}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {cohort._count.enrollments} students</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> {course.level}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {course.duration}</span>
                      </div>

                      {/* Payment */}
                      <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total</span>
                          <span className="text-white font-bold">{fmtNGN(enrollment.totalAmount ?? 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Paid</span>
                          <span className="text-green-400 font-bold">{fmtNGN(enrollment.amountPaid ?? 0)}</span>
                        </div>
                        {balance > 0 && (
                          <div className="flex justify-between border-t border-white/5 pt-1.5">
                            <span className="text-amber-400 font-bold">Balance due</span>
                            <span className="text-amber-400 font-black">{fmtNGN(balance)}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/student/classroom/${cohort.id}`}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-black rounded-xl transition-all text-sm"
                      >
                        Enter Classroom <ArrowRight className="w-4 h-4" />
                      </Link>

                      {balance > 0 && (
                        <Link
                          href={`/academy/${course.slug}`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold rounded-xl transition-all text-xs"
                        >
                          Pay balance {fmtNGN(balance)} →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
