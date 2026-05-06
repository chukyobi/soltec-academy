"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, ClipboardList, CheckSquare, Settings, MessageSquare, Plus, X, Loader2, CheckCircle2, AlertCircle, Clock, ChevronDown, Send, Shield, UserX, UserCheck, Video, Zap, Trophy, AtSign, Image as ImageIcon, Star, Radio, Calendar } from "lucide-react";
import { useClassroomPusher } from "@/hooks/useClassroomPusher";
import { MentionInput } from "@/components/classroom/MentionInput";
import { LiveClassroom } from "@/components/classroom/LiveClassroom";
import { Toaster, toast } from "react-hot-toast";

type Tab = "students"|"assignments"|"assessments"|"attendance"|"chat"|"settings"|"schedule";
interface Props {
  cohort: { 
    id:string; 
    name:string; 
    course:{title:string;color:string}; 
    totalStudents:number; 
    isLive: boolean;
    liveRoomId: string|null;
  };
  tutorName: string;
  userId: string;
  initSettings: any;
}

export default function TutorClassroomClient({ cohort: initialCohort, tutorName, userId, initSettings }:Props) {
  const [tab, setTab] = useState<Tab>("chat");
  const [isLive, setIsLive] = useState(initialCohort.isLive);
  const [liveToken, setLiveToken] = useState<string|null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: "", description: "", scheduledAt: "" });
  const chatBottom = useRef<HTMLDivElement>(null);

  const fetch_ = (url:string) => fetch(url).then(r=>r.ok?r.json():[]);
  const load = useCallback(async()=>{
    if(tab==="students" || tab==="chat") setStudents(await fetch_(`/api/classroom/${initialCohort.id}/students`));
    if(tab==="schedule") setScheduledSessions(await fetch_(`/api/classroom/${initialCohort.id}/live-sessions`));
    if(tab==="chat") setMessages(await fetch_(`/api/classroom/${initialCohort.id}/messages`));
  },[tab, initialCohort.id]);

  useEffect(()=>{ load(); },[load]);
  useEffect(()=>{ if(tab==="chat") chatBottom.current?.scrollIntoView({behavior:"smooth"}); },[messages, tab]);

  useClassroomPusher(initialCohort.id, userId, (newMsg) => {
    setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
  }, (status) => setIsLive(status));

  async function toggleLive(){ 
    setLoading(true);
    const r = await fetch(`/api/classroom/${initialCohort.id}/live`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({isLive: !isLive})});
    if(r.ok){
      setIsLive(!isLive);
      if (!isLive) {
         // If starting, get token
         const tR = await fetch(`/api/classroom/${initialCohort.id}/live/token`);
         if(tR.ok) setLiveToken((await tR.json()).token);
      } else {
         setLiveToken(null);
      }
    }
    setLoading(false);
  }

  async function createSchedule(){
    setLoading(true);
    const r = await fetch(`/api/classroom/${initialCohort.id}/live-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSchedule)
    });
    if(r.ok){
      toast.success("Class scheduled successfully!");
      setShowScheduleModal(false);
      setNewSchedule({ title: "", description: "", scheduledAt: "" });
      load();
    }
    setLoading(false);
  }

  async function sendMsg(){ 
    if(!msgInput.trim()) return; 
    setLoading(true);
    const mentionNames = msgInput.match(/@\w+/g)?.map(m => m.slice(1)) || [];
    const mentionIds = students.filter(u => mentionNames.includes(u.name.replace(/\s/g, ''))).map(u => u.id);
    await fetch(`/api/classroom/${initialCohort.id}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:msgInput, mentions: mentionIds})}); 
    setMsgInput(""); 
    setLoading(false);
  }

  const TABS = [
    {id:"chat",label:"Chat",icon:MessageSquare},
    {id:"schedule",label:"Schedule",icon:Calendar},
    {id:"students",label:"Students",icon:Users},
    {id:"attendance",label:"Attendance",icon:CheckSquare},
    {id:"settings",label:"Settings",icon:Settings}
  ] as const;

  const mentionableUsers = students.filter(u => u.id !== userId);

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      <Toaster position="top-right" />

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-xl">Schedule Live Class</h3>
                <button onClick={()=>setShowScheduleModal(false)}><X className="w-5 h-5 text-slate-500 hover:text-white"/></button>
             </div>
             <div className="space-y-4">
                <div><label className="text-slate-500 text-[10px] uppercase font-black mb-1 block">Class Title</label>
                <input type="text" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Masterclass on UI/UX" value={newSchedule.title} onChange={e=>setNewSchedule(p=>({...p,title:e.target.value}))}/></div>
                <div><label className="text-slate-500 text-[10px] uppercase font-black mb-1 block">Scheduled Time</label>
                <input type="datetime-local" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" value={newSchedule.scheduledAt} onChange={e=>setNewSchedule(p=>({...p,scheduledAt:e.target.value}))}/></div>
                <button onClick={createSchedule} disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : "Broadcast Schedule"}
                </button>
             </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 bg-[#09090f]/90 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/tutor/dashboard" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/></Link>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${initialCohort.course.color} flex items-center justify-center`}><GraduationCap className="w-5 h-5 text-white"/></div>
            <div>
               <div className="flex items-center gap-2">
                  <p className="text-white font-black text-sm">{initialCohort.name}</p>
                  {isLive && <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">LIVE</span>}
               </div>
               <p className="text-slate-500 text-xs">{initialCohort.course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={()=>setShowScheduleModal(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-black transition-all">Schedule Class</button>
             <button onClick={toggleLive} disabled={loading} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg ${isLive ? 'bg-red-600/20 text-red-400 border border-red-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : isLive ? <Radio className="w-3.5 h-3.5"/> : <Video className="w-3.5 h-3.5"/>}
                {isLive ? 'End Stream' : 'Start Live Now'}
             </button>
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 sticky top-[61px] z-10 bg-[#09090f]/80 backdrop-blur overflow-hidden">
        <div className="max-w-5xl mx-auto flex overflow-x-auto no-scrollbar">
          {TABS.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setTab(id)} className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${tab===id?"border-teal-500 text-white":"border-transparent text-slate-500 hover:text-slate-300"}`}>
              <Icon className="w-3.5 h-3.5"/>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        {isLive && liveToken && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"/> Tutor Stream Console</h3>
                <button onClick={()=>setLiveToken(null)} className="text-slate-500 hover:text-white text-xs font-bold">Minimize Console</button>
             </div>
             <LiveClassroom roomName={`classroom-${initialCohort.id}`} token={liveToken} onLeave={()=>setLiveToken(null)}/>
          </div>
        )}

        {tab==="chat" && (
          <div className="flex flex-col h-[75vh] bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m:any)=>{
                const isMe = m.userId === userId;
                const isTutor = m.user?.role === "TUTOR" || m.user?.role === "ADMIN";
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                    <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center text-white text-xs font-black ring-1 ring-white/10 overflow-hidden shadow-lg shrink-0">
                         {m.user?.image ? <img src={m.user.image} className="w-full h-full object-cover" /> : (m.user?.name??"?")[0].toUpperCase()}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-slate-500 text-[10px] font-black uppercase mb-1">{m.user?.name}</span>
                        <div className={`px-4 py-3 rounded-3xl text-sm border ${isMe ? 'bg-teal-600 border-teal-500 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-slate-300 rounded-tl-none'}`}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottom}/>
            </div>
            <MentionInput value={msgInput} onChange={setMsgInput} onSend={sendMsg} loading={loading} users={mentionableUsers}/>
          </div>
        )}

        {tab==="schedule" && (
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-white font-black text-2xl">Class Schedule</h3>
               <button onClick={()=>setShowScheduleModal(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20">+ Schedule New</button>
            </div>
            <div className="space-y-4">
               {scheduledSessions.length > 0 ? scheduledSessions.map(s => (
                 <div key={s.id} className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-6">
                       <div className="text-center w-16 px-2 py-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                          <p className="text-[10px] text-indigo-400 font-black uppercase">{new Date(s.scheduledAt).toLocaleString('en-US', { month: 'short' })}</p>
                          <p className="text-2xl text-white font-black">{new Date(s.scheduledAt).getDate()}</p>
                       </div>
                       <div>
                          <p className="text-white font-black text-lg">{s.title}</p>
                          <p className="text-slate-500 text-sm mt-1">{new Date(s.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • Live Video/Audio</p>
                       </div>
                    </div>
                    <button className="p-3 text-slate-500 hover:text-red-500 transition-colors"><X className="w-5 h-5"/></button>
                 </div>
               )) : <div className="text-center py-12"><Calendar className="w-12 h-12 text-slate-800 mx-auto mb-4"/><p className="text-slate-600 italic">No classes scheduled. Why not start one now?</p></div>}
            </div>
          </div>
        )}

        {tab==="students" && (
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-8">
            <h3 className="text-white font-black text-2xl mb-6">Enrolled Students ({students.length})</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(u => (
                <div key={u.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group">
                   <div className="w-12 h-12 rounded-2xl bg-teal-600/20 flex items-center justify-center text-teal-400 font-black text-lg overflow-hidden">
                      {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                   </div>
                   <div>
                      <p className="text-white font-bold">{u.name}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">{u.studentId || 'No ID'}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
