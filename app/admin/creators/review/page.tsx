"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, Check, X, User, 
  Mail, Shield, CreditCard, ExternalLink,
  MessageSquare, AlertCircle
} from "lucide-react";

export default function AdminCreatorReview() {
  const router = useRouter();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/creators/pending");
        const data = await res.json();
        setCreators(data.creators || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAction(userId: string, status: "APPROVED" | "REJECTED", reason?: string) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/creators/${userId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) throw new Error("Action failed");
      
      setCreators(prev => prev.filter(c => c.userId !== userId));
    } catch (e) {
      alert("Failed to update creator status");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return (
    <div className="fixed inset-0 bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090f] p-12 text-slate-200 font-sans">
      <header className="mb-16">
        <h1 className="text-4xl font-black text-white tracking-tight">Pending Creators</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium italic uppercase tracking-widest">Vetting & Compliance Dashboard</p>
      </header>

      <div className="space-y-6">
        {creators.length > 0 ? creators.map((creator) => (
          <div key={creator.id} className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 flex flex-col lg:flex-row gap-12 hover:border-white/10 transition-all shadow-xl">
            <div className="lg:w-1/3 space-y-6">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-[28px] bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-black text-3xl border border-indigo-500/20">
                    {creator.user.name[0]}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white leading-tight">{creator.user.name}</h3>
                    <p className="text-slate-500 text-sm flex items-center gap-2 mt-1"><Mail className="w-3.5 h-3.5"/> {creator.user.email}</p>
                 </div>
              </div>
              
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3 h-3"/> Public Bio</p>
                 <p className="text-slate-300 text-sm leading-relaxed italic">&quot;{creator.bio}&quot;</p>
                 <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">{creator.specialty}</span>
                 </div>
              </div>
            </div>

            <div className="lg:w-1/3 space-y-6 border-l border-r border-white/5 px-12">
               <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><Shield className="w-4 h-4 text-emerald-500"/> Legal & Verification</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Legal Name</span>
                     <span className="text-white text-sm font-bold">{creator.legalFullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">ID Number</span>
                     <span className="text-white text-sm font-bold">{creator.idNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Website</span>
                     <a href={creator.website} target="_blank" className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline">{creator.website ? "View Portfolio" : "None"} <ExternalLink className="w-3 h-3"/></a>
                  </div>
               </div>

               <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mt-8 mb-6 flex items-center gap-3"><CreditCard className="w-4 h-4 text-amber-500"/> Payout Info</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Bank</span>
                     <span className="text-white text-sm font-bold">{creator.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Account</span>
                     <span className="text-white text-sm font-bold">{creator.accountNumber}</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
               <button 
                 onClick={() => handleAction(creator.userId, "APPROVED")}
                 disabled={actionLoading === creator.userId}
                 className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
               >
                 {actionLoading === creator.userId ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Approve Creator
               </button>
               <button 
                 onClick={() => {
                   const reason = prompt("Reason for rejection?");
                   if(reason) handleAction(creator.userId, "REJECTED", reason);
                 }}
                 disabled={actionLoading === creator.userId}
                 className="w-full py-4 bg-white/5 hover:bg-red-600 hover:text-white text-slate-500 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
               >
                 <X className="w-5 h-5" /> Reject Application
               </button>
               
               <div className="mt-4 p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-3 h-3"/> Admin Note</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Approving this creator will grant them full access to the Soltec Creator Studio and enable payouts.</p>
               </div>
            </div>
          </div>
        )) : (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] opacity-40">
             <Shield className="w-16 h-16 text-slate-700 mx-auto mb-6" />
             <p className="text-slate-600 font-black uppercase tracking-[0.2em]">No pending applications</p>
          </div>
        )}
      </div>
    </div>
  );
}
