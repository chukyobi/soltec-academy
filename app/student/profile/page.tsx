import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GraduationCap, LogOut, ArrowRight, CheckCircle2, AlertCircle, Clock, BookOpen, Users, CalendarDays, Award, ChevronRight, ClipboardList, CheckSquare, Zap, Star, Trophy } from "lucide-react";
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

      <header className="sticky top-0 z-20 bg-[#09090f]/80 backdrop-blur border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto brightness-110" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/academy" className="text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest hidden sm:block transition-colors">Browse Tracks</Link>
            <Link href="/api/student/auth/logout" className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-black uppercase tracking-widest transition-colors"><LogOut className="w-4 h-4"/>Sign Out</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 shadow-2xl">
          <div className="flex items-center gap-6">
            <ProfileImageUpload initialImage={session.user.image} name={session.user.name} />
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{session.user.name??"Student"}</h1>
              <p className="text-slate-500 text-sm mt-0.5 font-medium">{session.user.email}</p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-3 py-1 rounded-xl uppercase tracking-widest">Student ID: {session.user.studentId??"TBD"}</span>
                {attendanceRate!==null && (
                  <span className={`text-[10px] font-black border px-3 py-1 rounded-xl uppercase tracking-widest ${attendanceRate >= 70 ? 'text-green-400 bg-green-400/10 border-green-500/20' : 'text-amber-400 bg-amber-400/10 border-amber-500/20'}`}>
                    Avg. Attendance: {attendanceRate}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
             <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">Academic Status</p>
             <div className="px-5 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl font-black text-xs">
                In Training
             </div>
          </div>
        </div>

        {/* Stats */}
        <div data-tour="stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {label:"Enrolled Tracks",value:enrollments.length,icon:GraduationCap,color:"from-indigo-500 to-purple-600"},
            {label:"Pending Tasks",value:activeAssignments.length,icon:ClipboardList,color:"from-amber-500 to-orange-600"},
            {label:"Performance",value:attendanceRate!==null?`${attendanceRate}%`:"Good",icon:Trophy,color:"from-green-500 to-emerald-600"},
            {label:"Total Invested",value:fmtNGN(totalPaid),icon:Star,color:"from-teal-500 to-cyan-600"},
          ].map(({label,value,icon:Icon,color})=>(
            <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6 group hover:bg-white/[0.06] transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6 text-white"/></div>
              <p className="text-white font-black text-2xl leading-tight">{value}</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1.5">{label}</p>
            </div>
          ))}
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

        {/* My Classrooms */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">Active Classrooms</h2>
            <Link href="/academy" className="px-4 py-2 bg-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all">Browse More</Link>
          </div>
          {enrollments.length===0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-20 text-center">
              <GraduationCap className="w-20 h-20 text-slate-800 mx-auto mb-6"/>
              <h3 className="text-white font-black text-2xl mb-2">Your academy journey starts here</h3>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">Enroll in a track to unlock your classroom, mentors, and advanced learning tools.</p>
              <Link href="/academy" className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20">Find Your Track <ArrowRight className="w-5 h-5"/></Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {enrollments.map((enrollment: any)=>{
                const cohort=enrollment.cohort, course=cohort.course;
                const status=STATUS_STYLES[enrollment.paymentStatus]??STATUS_STYLES.UNPAID;
                const StatusIcon=status.icon;
                const balance=(enrollment.totalAmount??0)-(enrollment.amountPaid??0);
                const cohortAssignments=(allAssignments as any[]).filter(a=>a.cohortId===cohort.id);
                const submitted=cohortAssignments.filter(a=>a.submissions.length>0).length;
                const cohortSessions=(attendanceSessions as any[]).filter(s=>s.cohortId===cohort.id);
                const cohortAttended=cohortSessions.filter(s=>s.records.length>0).length;
                const threshold=cohort.settings?.passThreshold??70;
                const progress=cohortSessions.length>0?Math.round((cohortAttended/cohortSessions.length)*100):0;
                return (
                  <div key={enrollment.id} className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden group hover:border-indigo-500/30 transition-all shadow-2xl">
                    <div className={`bg-gradient-to-br ${course.color} p-8 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/30"/>
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"/>
                      <div className="relative flex items-start justify-between">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"><BookOpen className="w-7 h-7 text-white"/></div>
                        <span className={`flex items-center gap-2 ${status.bg} ${status.text} border ${status.border} text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-2xl backdrop-blur-md shadow-xl`}><StatusIcon className="w-3.5 h-3.5"/>{status.label}</span>
                      </div>
                      <div className="relative mt-6">
                        <h3 className="text-white font-black text-2xl leading-tight">{course.title}</h3>
                        <p className="text-white/70 text-sm font-bold mt-1 uppercase tracking-widest">{cohort.name}</p>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                        <div className="flex flex-col gap-1"><p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Start Date</p><p className="text-white font-bold">{fmtDate(cohort.startDate)}</p></div>
                        <div className="flex flex-col gap-1 items-end text-right"><p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Class Size</p><p className="text-white font-bold">{cohort._count.enrollments} Students</p></div>
                        <div className="flex flex-col gap-1"><p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Tasks</p><p className="text-white font-bold">{submitted} / {cohortAssignments.length} Done</p></div>
                        <div className="flex flex-col gap-1 items-end text-right"><p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Attendance</p><p className="text-white font-bold">{cohortAttended} / {cohortSessions.length} Check-ins</p></div>
                      </div>
                      
                      {cohortSessions.length>0 && (
                        <div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2"><span className="text-slate-500">Progress to Certificate</span><span className={progress>=threshold?"text-green-400":"text-amber-400"}>{progress}% / {threshold}% Goal</span></div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5"><div className={`h-full rounded-full transition-all duration-1000 ${progress>=threshold?"bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]":"bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"}`} style={{width:`${progress}%`}}/></div>
                        </div>
                      )}
                      
                      <div className="pt-2 flex flex-col gap-4">
                        <Link data-tour="classroom-btn" href={`/student/classroom/${cohort.id}`} className="w-full flex items-center justify-center gap-4 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all text-sm shadow-2xl shadow-indigo-500/30 active:scale-[0.98]">Enter Your Classroom <ArrowRight className="w-5 h-5"/></Link>
                        {balance>0 && <Link href={`/academy/${course.slug}`} className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black rounded-2xl transition-all text-[10px] uppercase tracking-[0.2em]">Pay Remaining Balance: {fmtNGN(balance)}</Link>}
                      </div>
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
