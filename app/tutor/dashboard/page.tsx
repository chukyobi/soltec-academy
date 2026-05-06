import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  GraduationCap, Users, CalendarDays, BookOpen,
  ChevronRight, LogOut, ClipboardList, Layers,
  BarChart2, Code2, Database, MonitorSmartphone,
  CheckSquare
} from "lucide-react";

export const revalidate = 0;

const SLUG_ICONS: Record<string, React.ElementType> = {
  "product-design": Layers,
  "ui-ux-design": MonitorSmartphone,
  "data-analysis": BarChart2,
  "frontend-web-dev": Code2,
  "backend-web-dev": Database,
};

function fmtDate(d: Date | null) {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TutorDashboardPage() {
  const session = await getSession("tutor").catch(() => null);
  if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
    redirect("/tutor/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.needsPasswordChange) {
    redirect("/tutor/setup");
  }

  // Find cohorts where this user is assigned as a tutor
  const cohorts = await prisma.cohort.findMany({
    where: {
      tutors: {
        some: { id: session.user.id }
      }
    },
    include: {
      course: { select: { id: true, title: true, slug: true, color: true, level: true } },
      _count: { select: { enrollments: true, assignments: true } },
      assignments: {
        include: {
          submissions: {
            where: { score: null },
            include: { user: { select: { name: true } } }
          }
        }
      },
      attendanceSessions: {
        include: {
          records: {
            take: 5,
            orderBy: { checkedInAt: "desc" },
            include: { user: { select: { name: true } } }
          }
        },
        orderBy: { openedAt: "desc" },
        take: 5
      }
    } as any,
    orderBy: { startDate: "asc" },
  });

  const totalStudents = cohorts.reduce((s: any, c: any) => s + c._count.enrollments, 0);
  const totalAssignments = cohorts.reduce((s: any, c: any) => s + c._count.assignments, 0);

  // Flatten pending reviews
  const pendingReviews = (cohorts as any[]).flatMap(c => 
    (c.assignments || []).flatMap((a: any) => 
      (a.submissions || []).map((s: any) => ({
        ...s,
        assignmentTitle: a.title,
        cohortName: c.name,
        cohortId: c.id
      }))
    )
  ).sort((a: any, b: any) => b.submittedAt.getTime() - a.submittedAt.getTime()).slice(0, 10);

  // Flatten activity
  const recentActivity = (cohorts as any[]).flatMap(c => 
    (c.attendanceSessions || []).flatMap((as: any) => 
      (as.records || []).map((r: any) => ({
        ...r,
        cohortName: c.name,
        cohortId: c.id,
        sessionLabel: as.label || "Class Session"
      }))
    )
  ).sort((a: any, b: any) => b.checkedInAt.getTime() - a.checkedInAt.getTime()).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-20 bg-[#09090f]/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm">Tutor Dashboard</p>
            <p className="text-slate-500 text-xs">{session.user.name ?? session.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white text-xs font-bold transition-colors">← Site</Link>
          <Link href="/api/tutor/auth/logout" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">
              Welcome back, {session.user.name?.split(" ")[0] ?? "Tutor"} 👋
            </h1>
            <p className="text-slate-400 mt-1">Here are all the cohorts you&apos;re currently teaching.</p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-white font-black text-xl">{pendingReviews.length}</p>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Pending Reviews</p>
             </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Cohorts Assigned", value: cohorts.length, icon: GraduationCap, color: "from-teal-500 to-emerald-600" },
            { label: "Total Students", value: totalStudents, icon: Users, color: "from-indigo-500 to-purple-600" },
            { label: "Assignments", value: totalAssignments, icon: ClipboardList, color: "from-amber-500 to-orange-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content: Cohorts */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-black text-white mb-5">Your Cohorts</h2>
              {cohorts.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-12 text-center">
                  <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No cohorts assigned yet</p>
                  <p className="text-slate-600 text-sm mt-1">Contact your admin to get assigned to a cohort.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {cohorts.map((cohort: any) => {
                    const Icon = SLUG_ICONS[cohort.course.slug] ?? BookOpen;
                    return (
                      <Link
                        key={cohort.id}
                        href={`/tutor/classroom/${cohort.id}`}
                        className="group bg-white/[0.04] border border-white/[0.07] hover:border-teal-500/40 hover:bg-white/[0.07] rounded-3xl p-6 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cohort.course.color} flex items-center justify-center`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <span className="text-teal-400 text-xs font-black uppercase tracking-widest bg-teal-400/10 px-2 py-1 rounded-full">
                            {cohort.course.level}
                          </span>
                        </div>

                        <h3 className="text-white font-black text-lg leading-tight mb-1">{cohort.name}</h3>
                        <p className="text-slate-400 text-sm mb-4">{cohort.course.title}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> {fmtDate(cohort.startDate)}</span>
                          <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {cohort._count.enrollments} students</span>
                          <span className="flex items-center gap-1.5"><ClipboardList className="w-3 h-3" /> {cohort._count.assignments} assignments</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-teal-400 font-black text-sm group-hover:gap-2.5 transition-all">
                          Enter Classroom <ChevronRight className="w-4 h-4" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Reviews */}
            <div>
              <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                Pending Reviews
              </h2>
              {pendingReviews.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center text-slate-500 text-sm">
                  No submissions to grade. Well done!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.map((rev, idx) => (
                    <Link 
                      key={idx} 
                      href={`/tutor/classroom/${rev.cohortId}?tab=assignments`}
                      className="flex items-center justify-between bg-white/[0.03] border border-white/5 hover:border-white/10 p-4 rounded-xl transition-all group"
                    >
                      <div>
                        <p className="text-white font-bold text-sm">{rev.user.name}</p>
                        <p className="text-slate-500 text-xs">{rev.assignmentTitle} · {rev.cohortName}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Activity Feed */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center text-slate-500 text-sm">
                  No recent check-ins.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((act, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-xs font-bold">
                          <span className="text-white">{act.user.name}</span> checked in
                        </p>
                        <p className="text-slate-500 text-[10px] mt-0.5">
                          {act.cohortName} · {act.sessionLabel}
                        </p>
                        <p className="text-slate-600 text-[9px] uppercase font-black mt-1">
                          {new Date(act.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
