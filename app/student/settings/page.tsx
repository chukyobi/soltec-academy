import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LogOut, CreditCard, User, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const revalidate = 0;

function fmtNGN(n:number){ return `₦${n.toLocaleString("en-NG")}`; }
function fmtDate(d:Date|null){ if(!d) return "TBD"; return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }

const STATUS_STYLES:Record<string,{bg:string;text:string;border:string;icon:any;label:string}> = {
  PAID:{bg:"bg-green-500/10",text:"text-green-400",border:"border-green-500/20",icon:CheckCircle2,label:"Fully Paid"},
  PARTIAL:{bg:"bg-amber-500/10",text:"text-amber-400",border:"border-amber-500/20",icon:AlertCircle,label:"Part Paid"},
  UNPAID:{bg:"bg-red-500/10",text:"text-red-400",border:"border-red-500/20",icon:Clock,label:"Unpaid"},
};

export default async function StudentSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession().catch(()=>null) as any;
  if (!session) redirect("/student/login?redirect=/student/settings");

  const tab = (await searchParams).tab ?? "profile";

  const enrollments = await (prisma.cohortEnrollment as any).findMany({
    where:{ userId: session.userId },
    include:{
      cohort:{ include:{ course:true } },
    },
    orderBy:{ createdAt:"desc" },
  });

  const totalPaid = enrollments.reduce((s: any, e: any)=>s+(e.amountPaid??0),0);

  return (
    <div className="min-h-screen bg-[#09090f]">
      <header className="sticky top-0 z-30 bg-[#09090f]/90 backdrop-blur-xl border-b border-white/5 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-6">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-0 invert" />
            <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />
            <p className="text-white font-black text-lg tracking-tighter uppercase leading-none hidden sm:block">Settings</p>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/student/profile" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block transition-all">
               Dashboard
            </Link>
            <Link href="/api/student/auth/logout" className="group flex items-center gap-2 text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Sign Out
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <Link href="/student/settings?tab=profile" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${tab === 'profile' ? 'bg-indigo-600/10 text-indigo-400 font-black' : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'}`}>
            <User className="w-5 h-5"/> Profile
          </Link>
          <Link href="/student/settings?tab=payments" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${tab === 'payments' ? 'bg-indigo-600/10 text-indigo-400 font-black' : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'}`}>
            <CreditCard className="w-5 h-5"/> Payments
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1">
           {tab === "profile" && (
             <div className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 space-y-6">
                <h2 className="text-2xl font-black text-white">Profile Settings</h2>
                <div className="space-y-4">
                   <div>
                     <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Name</label>
                     <input type="text" readOnly value={session.user.name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Email</label>
                     <input type="text" readOnly value={session.user.email} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Student ID</label>
                     <input type="text" readOnly value={session.user.studentId ?? "N/A"} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
                   </div>
                </div>
             </div>
           )}

           {tab === "payments" && (
             <div className="space-y-8">
               <div className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 flex items-center justify-between">
                 <div>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Invested</p>
                   <p className="text-4xl font-black text-white tracking-tighter">{fmtNGN(totalPaid)}</p>
                 </div>
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-xl">
                   <CreditCard className="w-8 h-8 text-white" />
                 </div>
               </div>

               <div>
                 <h3 className="text-xl font-black text-white mb-6">Payment History</h3>
                 {enrollments.length === 0 ? (
                   <p className="text-slate-500">No payment history found.</p>
                 ) : (
                   <div className="space-y-4">
                     {enrollments.map((e: any) => {
                       const statusStyle = STATUS_STYLES[e.paymentStatus] ?? STATUS_STYLES.UNPAID;
                       const StatusIcon = statusStyle.icon;
                       const balance = (e.totalAmount ?? 0) - (e.amountPaid ?? 0);
                       return (
                         <div key={e.id} className="bg-[#0d0d14] border border-white/5 rounded-[24px] p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                           <div>
                             <p className="text-white font-black text-lg">{e.cohort.course.title}</p>
                             <p className="text-slate-500 text-xs mt-1 font-bold">{e.cohort.name} • {fmtDate(e.createdAt)}</p>
                             <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-2">Ref: {e.reference ?? "N/A"}</p>
                           </div>
                           <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className={`flex items-center gap-1.5 text-[10px] font-black border px-3 py-1.5 rounded-xl uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                <StatusIcon className="w-3 h-3"/> {statusStyle.label}
                              </span>
                              <div className="text-right mt-1">
                                 <p className="text-white font-black text-lg">{fmtNGN(e.amountPaid ?? 0)} <span className="text-slate-500 text-xs font-medium">paid</span></p>
                                 {balance > 0 && <p className="text-amber-500 text-xs font-black">Balance: {fmtNGN(balance)}</p>}
                              </div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
