import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GraduationCap, LogOut, ArrowRight, CheckCircle2, AlertCircle, Clock, BookOpen, Users, CalendarDays, Award, ChevronRight, ClipboardList, CheckSquare, Zap, Star, Trophy, Bell, Radio } from "lucide-react";
import { WelcomeTour } from "@/components/student/WelcomeTour";
import { ProfileImageUpload } from "@/components/student/ProfileImageUpload";

export const revalidate = 0;

function fmtDate(d:Date|null){ if(!d) return "TBD"; return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }
function fmtNGN(n:number){ return `₦${n.toLocaleString("en-NG")}`; }
function timeLeft(dueAt:Date){ const ms=dueAt.getTime()-Date.now(); if(ms<=0) return null; const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000); return h>0?`${h}h ${m}m left`:`${m}m left`; }

const STATUS_STYLES:Record<string,{bg:string;text:string;border:string;icon:typeof CheckCircle2;label:string}> = {
  PAID:{bg:"bg-green-500/10",text:"text-green-400",border:"border-green-500/20",icon:CheckCircle2,label:"Fully Paid"},
  PARTIAL:{bg:"bg-amber-500/10",text:"text-amber-400",border:"border-amber-500/20",icon:AlertCircle,label:"Part Paid"},
  UNPAID:{bg:"bg-red-500/10",text:"text-red-400",border:"border-red-500/20",icon:Clock,label:"Unpaid"},
};

export default async function StudentProfilePage() {
  const session = await getSession().catch(()=>null) as any;
  if (!session) redirect("/student/login?redirect=/student/profile");

  const enrollments = await (prisma.cohortEnrollment as any).findMany({
    where:{ userId: session.userId },
    include:{
      cohort:{
        include:{
          course:{ select:{id:true,title:true,slug:true,color:true,level:true,duration:true} },
          _count:{ select:{enrollments:true,assignments:true} },
          settings: true,
        },
      },
    },
    orderBy:{ createdAt:"desc" },
  });

  // All assignments across all enrolled cohorts
  const cohortIds = enrollments.map((e: any)=>e.cohortId);
  const allAssignments = await (prisma.assignment as any).findMany({
    where:{ cohortId:{ in: cohortIds } },
    include:{
      submissions:{ where:{ userId: session.userId } },
      cohort:{ select:{ name:true, course:{ select:{ title:true, color:true } } } },
    },
    orderBy:{ createdAt:"desc" },
  });

  // Attendance across all cohorts
  const attendanceSessions = await (prisma as any).attendanceSession.findMany({
    where:{ cohortId:{ in: cohortIds }, closedAt:{ not:null } },
    include:{ records:{ where:{ userId: session.userId } } },
  });

  const activeAssignments = allAssignments.filter((a: any)=>a.isOpen&&(!a.dueAt||new Date(a.dueAt)>new Date())&&!a.submissions.length);
  const totalSessions = attendanceSessions.length;
  const attendedSessions = attendanceSessions.filter((s: any)=>s.records.length>0).length;
  const attendanceRate = totalSessions>0?Math.round((attendedSessions/totalSessions)*100):null;

  const totalPaid = enrollments.reduce((s: any, e: any)=>s+(e.amountPaid??0),0);

  return (
    <div className="min-h-screen bg-[#09090f]">
      <WelcomeTour userName={session.user.name??"Student"} hasSeenWelcome={session.user.hasSeenWelcome} hasSeenTour={session.user.hasSeenTour}/>

      <header className="sticky top-0 z-30 bg-[#09090f]/90 backdrop-blur-xl border-b border-white/5 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-6">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-0 invert" />
            <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />
            <p className="text-white font-black text-lg tracking-tighter uppercase leading-none hidden sm:block">Student Portal</p>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/academy" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block transition-all">Browse Tracks</Link>
            <Link href="/api/student/auth/logout" className="group flex items-center gap-2 text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Sign Out
            </Link>
          </div>
        </div>
      </header>      <div className="max-w-6xl mx-auto px-8 py-12 space-y-12">
        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-[#0d0d14] border border-white/5 rounded-[48px] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center gap-10 relative z-10">
            <ProfileImageUpload initialImage={session.user.image} name={session.user.name} />
            <div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">{session.user.name??"Student"}</h1>
              <p className="text-slate-500 text-lg mt-2 font-black uppercase tracking-widest opacity-60">{session.user.email}</p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <span className="text-[11px] font-black text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-4 py-2 rounded-2xl uppercase tracking-widest shadow-lg">ID: {session.user.studentId??"TBD"}</span>
                {attendanceRate!==null && (
                  <span className={`text-[11px] font-black border px-4 py-2 rounded-2xl uppercase tracking-widest shadow-lg ${attendanceRate >= 70 ? 'text-green-400 bg-green-400/10 border-green-500/20' : 'text-amber-400 bg-amber-400/10 border-amber-500/20'}`}>
                    Attendance: {attendanceRate}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 relative z-10">
             <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.4em]">Academic Standing</p>
             <div className="px-8 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20">
                In Training
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Stats and Content */}
          <div className="lg:col-span-3 space-y-12">
            <div data-tour="stats" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {label:"Enrolled Tracks",value:enrollments.length,icon:GraduationCap,color:"from-indigo-600 to-purple-600"},
                {label:"Pending Tasks",value:activeAssignments.length,icon:ClipboardList,color:"from-amber-500 to-orange-600"},
              ].map(({label,value,icon:Icon,color})=>(
                <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8 group hover:bg-white/[0.05] transition-all shadow-xl">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform`}><Icon className="w-8 h-8 text-white"/></div>
                  <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">{label}</p>
                </div>
              ))}
            </div>

            {/* ── My Tracks ── */}
            <div data-tour="tracks">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-indigo-400"/> My Enrolled Tracks
              </h2>

              {enrollments.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-2">
                    <BookOpen className="w-10 h-10 text-indigo-400/50"/>
                  </div>
                  <p className="text-white font-black text-xl tracking-tight">No Tracks Yet</p>
                  <p className="text-slate-500 text-sm max-w-xs">You haven&apos;t enrolled in any track yet. Browse our academy and join a cohort to get started.</p>
                  <Link href="/academy" className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
                    Browse Academy
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((e: any) => {
                    const course = e.cohort.course;
                    const cohort = e.cohort;
                    const statusStyle = STATUS_STYLES[e.paymentStatus] ?? STATUS_STYLES.UNPAID;
                    const StatusIcon = statusStyle.icon;
                    const accentColor = course.color ?? "#6366f1";
                    return (
                      <div key={e.id} className="group relative bg-[#0d0d14] border border-white/[0.06] rounded-[28px] p-6 hover:border-white/10 transition-all overflow-hidden">
                        {/* colour accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[28px]" style={{background: accentColor}}/>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pl-4">
                          {/* Track icon */}
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xl" style={{background: `${accentColor}22`, border: `1px solid ${accentColor}33`}}>
                            <GraduationCap className="w-7 h-7" style={{color: accentColor}}/>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-lg tracking-tight leading-tight truncate flex items-center gap-2">
                               {course.title}
                               {cohort.isLive && <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest"><Radio className="w-3 h-3 inline-block mr-1"/>Live</span>}
                            </p>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">{cohort.name}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              {course.level && (
                                <span className="text-[10px] font-black text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-xl uppercase tracking-widest">{course.level}</span>
                              )}
                              <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Users className="w-3 h-3"/> {cohort._count.enrollments} students
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <ClipboardList className="w-3 h-3"/> {cohort._count.assignments} tasks
                              </span>
                              {cohort.settings?.startDate && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  <CalendarDays className="w-3 h-3"/> Started {fmtDate(cohort.settings.startDate)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: payment badge + CTA */}
                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <span className={`flex items-center gap-1.5 text-[10px] font-black border px-3 py-1.5 rounded-xl uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              <StatusIcon className="w-3 h-3"/> {statusStyle.label}
                            </span>
                            <Link
                              href={`/student/classroom/${cohort.id}`}
                              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-105 hover:shadow-xl ${cohort.isLive ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : ''}`}
                              style={!cohort.isLive ? {background: accentColor} : {}}
                            >
                              {cohort.isLive ? <><Radio className="w-4 h-4 animate-pulse"/> Join Stream</> : <>Enter Classroom <ChevronRight className="w-4 h-4"/></>}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Assignments */}
            {activeAssignments.length>0 && (
              <div data-tour="assignments">
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3"><Zap className="w-6 h-6 text-amber-400"/>Priority Tasks</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeAssignments.map((a: any)=>{
                    const left=a.dueAt?timeLeft(new Date(a.dueAt)):null;
                    return (
                      <div key={a.id} className="bg-white/[0.03] border border-amber-500/20 rounded-3xl p-6 flex items-center justify-between gap-4 group hover:bg-amber-500/[0.02] transition-all">
                        <div>
                          <p className="text-white font-black text-lg tracking-tight">{a.title}</p>
                          <p className="text-slate-400 text-xs mt-1 font-black uppercase tracking-widest">{a.cohort.course.title} · {a.cohort.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {left && <p className="text-amber-400 font-black text-xs animate-pulse">{left}</p>}
                          <Link href={`/student/classroom/${a.cohortId}?tab=assignments`} className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] rounded-xl uppercase tracking-widest block transition-all">Submit →</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Notifications */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Bell className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-black text-white tracking-tight">Updates</h2>
              </div>
              <div className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 space-y-6">
                 <div className="flex gap-4 group">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 animate-pulse" />
                    <div>
                       <p className="text-white font-black text-sm leading-tight">Welcome to Academy</p>
                       <p className="text-slate-500 text-xs mt-1">Explore your tracks and start learning today.</p>
                       <p className="text-[9px] font-black text-slate-700 uppercase mt-2">Just Now</p>
                    </div>
                 </div>
                 <div className="h-px bg-white/5" />
                 <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-widest py-2">
                    End of alerts
                 </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/10 rounded-[32px] p-8">
               <h3 className="text-white font-black text-lg mb-4">Need Help?</h3>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">Our support team is available 24/7 to help you with your learning journey.</p>
               <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all text-xs uppercase tracking-widest">
                  Contact Support
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
