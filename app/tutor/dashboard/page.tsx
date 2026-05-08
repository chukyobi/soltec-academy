import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  GraduationCap, Users, CalendarDays, BookOpen,
  ChevronRight, LogOut, ClipboardList, Layers,
  BarChart2, Code2, Database, MonitorSmartphone,
  CheckSquare, ArrowRight, Bell
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
      <header className="sticky top-0 z-30 bg-[#09090f]/90 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/"><img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-0 invert" /></Link>
          <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />
          <div className="min-w-0">
            <p className="text-white font-black text-lg tracking-tighter uppercase leading-none">Tutor Portal</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">{session.user.name ?? session.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/api/tutor/auth/logout" className="group flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs font-black uppercase tracking-widest transition-all">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {[
            { label: "Cohorts Assigned", value: cohorts.length, icon: GraduationCap, color: "from-teal-500 to-emerald-600" },
            { label: "Total Students", value: totalStudents, icon: Users, color: "from-indigo-500 to-purple-600" },
            { label: "Assignments", value: totalAssignments, icon: ClipboardList, color: "from-amber-500 to-orange-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-[24px] p-8 flex items-center gap-6 group hover:bg-white/[0.06] transition-all">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content: Cohorts */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">Active Cohorts</h2>
                <div className="h-px flex-1 bg-white/5 mx-6 hidden sm:block" />
              </div>
              
              {cohorts.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-[32px] p-16 text-center">
                  <GraduationCap className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 text-lg font-black uppercase tracking-widest">No cohorts assigned yet</p>
                  <p className="text-slate-600 text-sm mt-2">Contact your admin to get assigned to a cohort.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {cohorts.map((cohort: any) => {
                    const Icon = SLUG_ICONS[cohort.course.slug] ?? BookOpen;
                    return (
                      <Link
                        key={cohort.id}
                        href={`/tutor/classroom/${cohort.id}`}
                        className="group bg-[#0d0d14] border border-white/5 hover:border-teal-500/30 hover:bg-[#12121c] rounded-[32px] p-8 transition-all shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-8">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cohort.course.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] bg-teal-400/10 border border-teal-400/20 px-3 py-1.5 rounded-full">
                            {cohort.course.level}
                          </span>
                        </div>

                        <h3 className="text-white font-black text-2xl leading-none mb-2 tracking-tight group-hover:text-teal-400 transition-colors">{cohort.name}</h3>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-8">{cohort.course.title}</p>

                        <div className="grid grid-cols-1 gap-3 text-[11px] text-slate-400 mb-8 font-black uppercase tracking-widest opacity-70">
                          <span className="flex items-center gap-2.5"><CalendarDays className="w-4 h-4 text-teal-500" /> {fmtDate(cohort.startDate)}</span>
                          <span className="flex items-center gap-2.5"><Users className="w-4 h-4 text-indigo-500" /> {cohort._count.enrollments} students</span>
                        </div>

                        <div className="flex items-center gap-2 text-teal-400 font-black text-sm group-hover:gap-4 transition-all">
                          Enter Classroom <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <ClipboardList className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-black text-white tracking-tight">Pending Reviews</h2>
              </div>
              {pendingReviews.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-10 text-center text-slate-600 font-black uppercase tracking-widest text-xs">
                  No submissions to grade
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((rev, idx) => (
                    <Link 
                      key={idx} 
                      href={`/tutor/classroom/${rev.cohortId}?tab=assignments`}
                      className="flex items-center justify-between bg-white/[0.03] border border-white/5 hover:border-white/20 p-6 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-white text-xs">
                            {rev.user.name?.[0]}
                         </div>
                         <div>
                           <p className="text-white font-black text-base">{rev.user.name}</p>
                           <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-0.5">{rev.assignmentTitle} · {rev.cohortName}</p>
                         </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-teal-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Notifications */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Bell className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-black text-white tracking-tight">Notifications</h2>
              </div>
              <div className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 space-y-6">
                 {/* This would ideally map from data, using a placeholder for now */}
                 <div className="flex gap-4 group">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 animate-pulse" />
                    <div>
                       <p className="text-white font-black text-sm leading-tight">New Student Enrollment</p>
                       <p className="text-slate-500 text-xs mt-1">A student just joined your Product Design cohort.</p>
                       <p className="text-[9px] font-black text-slate-700 uppercase mt-2">Just Now</p>
                    </div>
                 </div>
                 <div className="h-px bg-white/5" />
                 <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-widest py-2">
                    End of alerts
                 </p>
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Users className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-white tracking-tight">Live Check-ins</h2>
              </div>
              {recentActivity.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-10 text-center text-slate-600 font-black uppercase tracking-widest text-xs">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-6 px-2">
                  {recentActivity.map((act, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-all">
                        <CheckSquare className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-black truncate">
                          {act.user.name}
                        </p>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter mt-1 truncate">
                          {act.cohortName} · {act.sessionLabel}
                        </p>
                        <p className="text-slate-700 text-[9px] font-black uppercase mt-1">
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
