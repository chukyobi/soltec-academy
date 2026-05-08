'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, ClipboardList, CheckSquare, Settings, MessageSquare, Plus, X, Loader2, CheckCircle2, AlertCircle, Clock, ChevronDown, Send, Shield, UserX, UserCheck, Video, Zap, Trophy, AtSign, Image as ImageIcon, Star, Radio, Calendar, Bell, BookOpen } from "lucide-react";
import { useClassroomPusher } from "@/hooks/useClassroomPusher";
import { MentionInput } from "@/components/classroom/MentionInput";
import { LiveClassroom } from "@/components/classroom/LiveClassroom";
import { ReactionList } from "@/components/classroom/ReactionList";
import { Toaster, toast } from "react-hot-toast";
import { UserMenu } from "@/components/UserMenu";

type Tab = "students"|"assignments"|"curriculum"|"attendance"|"chat"|"settings"|"schedule";
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
  userEmail: string;
  userImage?: string|null;
  initSettings: any;
}

export default function TutorClassroomClient({ 
  cohort: initialCohort, tutorName, userId, userEmail, userImage, initSettings 
}:Props) {
  const [tab, setTab] = useState<Tab>("chat");
  const [isLive, setIsLive] = useState(initialCohort.isLive);
  const [liveToken, setLiveToken] = useState<string|null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string|null>(initialCohort.liveRoomId);
  const [students, setStudents] = useState<any[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: "", description: "", scheduledAt: "" });
  const chatBottom = useRef<HTMLDivElement>(null);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([{id:1, title:"Introduction", materials:["Syllabus.pdf"]}]);
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newAssign, setNewAssign] = useState({ title:"", description:"", dueAt:"", maxScore:100, file:null });

  const fetch_ = (url:string) => fetch(url).then(r=>r.ok?r.json():[]);
  const load = useCallback(async()=>{
    if(tab==="students" || tab==="chat") setStudents(await fetch_(`/api/classroom/${initialCohort.id}/students`));
    if(tab==="schedule") setScheduledSessions(await fetch_(`/api/classroom/${initialCohort.id}/live-sessions`));
    if(tab==="chat") setMessages(await fetch_(`/api/classroom/${initialCohort.id}/messages`));
    if(tab==="assignments") setAssignments(await fetch_(`/api/classroom/${initialCohort.id}/assignments`));
    if(tab==="attendance") setAttendanceSessions(await fetch_(`/api/classroom/${initialCohort.id}/attendance`));
  },[tab, initialCohort.id]);

  useEffect(()=>{ load(); },[load]);

  useClassroomPusher(
    initialCohort.id, 
    userId, 
    (newMsg) => {
      setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
    }, 
    (status) => {
      setIsLive(status);
      if (!status) setLiveToken(null);
      if (status && tab === "chat") setTab("students");
    }, 
    (reactionData) => {
      setMessages(prev => prev.map(m => {
        if (m.id === reactionData.messageId) {
          return { ...m, reactions: reactionData.counts };
        }
        return m;
      }));
    },
    undefined, 
    () => {
      if(tab==="attendance") fetch_(`/api/classroom/${initialCohort.id}/attendance`).then(setAttendanceSessions);
    }
  );

  async function toggleLive(){ 
    setLoading(true);
    const action = isLive ? "stop" : "start";
    
    // 1. Update Cohort Live Status
    const r = await fetch(`/api/classroom/${initialCohort.id}/live`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({isLive: !isLive})});
    
    if(r.ok){
      setIsLive(!isLive);
      if (!isLive) {
         // Starting
         const tR = await fetch(`/api/classroom/${initialCohort.id}/live/token`);
         if(tR.ok) {
            const data = await tR.json();
            setLiveToken(data.token);
            setActiveSessionId(data.sessionId);
            // Patch session as started
            await fetch(`/api/classroom/${initialCohort.id}/live-sessions/${data.sessionId}`, {
               method: "PATCH",
               body: JSON.stringify({ action: "start" })
            });
         }
      } else if (activeSessionId) {
         // Stopping
         await fetch(`/api/classroom/${initialCohort.id}/live-sessions/${activeSessionId}`, {
            method: "PATCH",
            body: JSON.stringify({ action: "stop" })
         });
         setLiveToken(null);
         setActiveSessionId(null);
      }
    }
    setLoading(false);
  }

  async function broadcastSchedule(){
    if (!newSchedule.title || !newSchedule.scheduledAt) return toast.error("Title and Time required");
    setLoading(true);
    
    // 1. Create Schedule
    const r = await fetch(`/api/classroom/${initialCohort.id}/live-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSchedule)
    });

    if(r.ok){
      // 2. Send Broadcast with personalized messaging
      await fetch(`/api/classroom/${initialCohort.id}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `New Session: ${newSchedule.title}`,
          message: `Join our live class on ${new Date(newSchedule.scheduledAt).toLocaleString()}`
        })
      });

      toast.success("Broadcast sent to everyone!");
      setShowScheduleModal(false);
      setNewSchedule({ title: "", description: "", scheduledAt: "" });
      load();
    }
    setLoading(false);
  }

  async function sendMsg(){ 
    if(!msgInput.trim()) return; 
    setLoading(true);
    const res = await fetch(`/api/classroom/${initialCohort.id}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:msgInput})}); 
    if (res.ok) setMsgInput(""); 
    setLoading(false);
  }

  async function handleReact(msgId: string, emoji: string) {
    await fetch(`/api/classroom/${initialCohort.id}/messages/${msgId}/react`, {
      method: "POST",
      body: JSON.stringify({ emoji, type: "classroom" })
    });
  }

  async function createAssignment() {
    if(!newAssign.title || !newAssign.description) return toast.error("Title and description required");
    setLoading(true);
    const r = await fetch(`/api/classroom/${initialCohort.id}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAssign)
    });
    if(r.ok) {
      toast.success("Assignment created!");
      setShowAssignModal(false);
      setNewAssign({ title:"", description:"", dueAt:"", maxScore:100, file:null });
      load();
    }
    setLoading(false);
  }

  async function toggleSubmissionPortal(aId: string, currentStatus: boolean) {
    // Optimistic UI could be added here. Assuming an endpoint exists or simulating
    toast.success(currentStatus ? "Submission portal closed" : "Submission portal opened");
    setAssignments(prev => prev.map(a => a.id === aId ? {...a, isOpen: !currentStatus} : a));
  }

  async function toggleAttendance(sessionId?: string) {
    setLoading(true);
    const action = sessionId ? "close" : "open";
    const r = await fetch(`/api/classroom/${initialCohort.id}/attendance`, {
       method: "POST", headers:{"Content-Type":"application/json"},
       body: JSON.stringify({ action, sessionId, label: `Class Session ${new Date().toLocaleDateString()}` })
    });
    if(r.ok) {
       toast.success(sessionId ? "Attendance Closed" : "Attendance Opened");
       load();
    } else {
       const err = await r.json();
       toast.error(err.error || "Failed to toggle attendance");
    }
    setLoading(false);
  }

  const TABS = [
    ...(!isLive ? [{id:"chat",label:"Classroom Chat",icon:MessageSquare}] : []),
    {id:"curriculum",label:"Curriculum",icon:BookOpen},
    {id:"assignments",label:"Assignments",icon:ClipboardList},
    {id:"attendance",label:"Attendance",icon:CheckSquare},
    {id:"schedule",label:"Live Schedule",icon:Calendar},
    {id:"students",label:"Cohort Members",icon:Users},
    {id:"settings",label:"Portal Settings",icon:Settings}
  ];

  const allUsersExceptMe = students.filter(u => u.id !== userId);
  const activeAttendance = attendanceSessions.find(s => !s.closedAt);

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      <Toaster position="top-right" />

      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0d0d14] border border-white/10 rounded-[40px] p-10 max-w-md w-full animate-in zoom-in-95 shadow-[0_0_100px_rgba(79,70,229,0.1)]">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-white font-black text-2xl tracking-tight">Set Assignment</h3>
                <button onClick={()=>setShowAssignModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-slate-500 hover:text-white"/></button>
             </div>
             <div className="space-y-6">
                <div><label className="text-slate-600 text-[10px] uppercase font-black mb-2 block tracking-[0.2em]">Title</label>
                <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all" value={newAssign.title} onChange={e=>setNewAssign(p=>({...p,title:e.target.value}))}/></div>
                <div><label className="text-slate-600 text-[10px] uppercase font-black mb-2 block tracking-[0.2em]">Description / Instructions</label>
                <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all min-h-[100px]" value={newAssign.description} onChange={e=>setNewAssign(p=>({...p,description:e.target.value}))}/></div>
                <div><label className="text-slate-600 text-[10px] uppercase font-black mb-2 block tracking-[0.2em]">Material Upload (Optional)</label>
                <input type="file" className="text-slate-400 text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"/></div>
                <div><label className="text-slate-600 text-[10px] uppercase font-black mb-2 block tracking-[0.2em]">Submission Deadline</label>
                <input type="datetime-local" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all" value={newAssign.dueAt} onChange={e=>setNewAssign(p=>({...p,dueAt:e.target.value}))}/></div>
                <div className="pt-4">
                  <button onClick={createAssignment} disabled={loading} className="w-full py-5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-teal-600/20 active:scale-95 flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <><Send className="w-5 h-5"/> Deploy Assignment</>}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0d0d14] border border-white/10 rounded-[40px] p-10 max-w-md w-full animate-in zoom-in-95 shadow-[0_0_100px_rgba(79,70,229,0.1)]">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-white font-black text-2xl tracking-tight">Broadcast Session</h3>
                <button onClick={()=>setShowScheduleModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-slate-500 hover:text-white"/></button>
             </div>
             <div className="space-y-6">
                <div><label className="text-slate-600 text-[10px] uppercase font-black mb-2 block tracking-[0.2em]">Session Title</label>
                <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all" placeholder="Enter session name..." value={newSchedule.title} onChange={e=>setNewSchedule(p=>({...p,title:e.target.value}))}/></div>
                <div><label className="text-slate-600 text-[10px] uppercase font-black mb-2 block tracking-[0.2em]">Start Time</label>
                <input type="datetime-local" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all" value={newSchedule.scheduledAt} onChange={e=>setNewSchedule(p=>({...p,scheduledAt:e.target.value}))}/></div>
                
                <div className="pt-4">
                  <button onClick={broadcastSchedule} disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <><Bell className="w-5 h-5"/> Notify Everyone</>}
                  </button>
                  <p className="text-slate-600 text-[10px] text-center font-black uppercase tracking-widest mt-4">Personalized alerts will be sent to all members</p>
                </div>
             </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 bg-[#09090f]/95 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/tutor/dashboard" className="text-slate-500 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
            </Link>
            <Link href="/"><img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto brightness-0 invert" /></Link>
            <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />
            <div className="min-w-0">
               <div className="flex items-center gap-3">
                  <p className="text-white font-black text-lg truncate tracking-tight">{initialCohort.name}</p>
                  {isLive && <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] px-3 py-1 rounded-full font-black animate-pulse uppercase tracking-[0.2em]">Live Session</span>}
               </div>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] truncate opacity-60">{initialCohort.course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={()=>setShowScheduleModal(true)} className="hidden sm:block px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Broadcast</button>
             <button onClick={toggleLive} disabled={loading} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl ${isLive ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'bg-teal-600 text-white shadow-teal-500/20 active:scale-95'}`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : isLive ? <Radio className="w-5 h-5"/> : <Video className="w-5 h-5"/>}
                {isLive ? 'Stop Broadcast' : 'Start Stream'}
             </button>
             
             <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

             <UserMenu 
               user={{ name: tutorName, email: userEmail, image: userImage }} 
               role="tutor" 
             />
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 sticky top-[77px] z-10 bg-[#09090f]/90 backdrop-blur-md overflow-hidden">
        <div className="max-w-6xl mx-auto flex overflow-x-auto no-scrollbar px-2">
          {TABS.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setTab(id as Tab)} className={`flex items-center gap-2 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap border-b-2 transition-all ${tab===id?"border-teal-500 text-white":"border-transparent text-slate-500 hover:text-slate-300"}`}>
              <Icon className="w-4 h-4"/>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {isLive && liveToken && (
          <div className="mb-12 animate-in slide-in-from-top-6 duration-700">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-base uppercase tracking-[0.2em] flex items-center gap-3"><div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"/> Live Stream Console</h3>
                <button onClick={()=>setLiveToken(null)} className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">Hide Console</button>
             </div>
             <LiveClassroom roomName={`classroom-${initialCohort.id}`} token={liveToken} onLeave={()=>setLiveToken(null)}/>
          </div>
        )}

        {tab==="chat" && (
          <div className="flex flex-col h-[75vh] bg-[#0d0d14] border border-white/5 rounded-[40px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] relative">
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {messages.map((m:any)=>{
                const isMe = m.userId === userId;
                const isSystem = m.userId === 'system';

                if (isSystem) {
                  const hasJoinLink = m.content.includes('[JOIN_LIVE_STREAM]');
                  const cleanContent = m.content.replace('[JOIN_LIVE_STREAM]', '');
                  
                  return (
                    <div key={m.id} className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 w-full">
                      <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                        {cleanContent}
                      </div>
                      {hasJoinLink && !liveToken && isLive && (
                        <button 
                          onClick={toggleLive}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-500/40 animate-bounce active:scale-95 transition-all"
                        >
                          <Video className="w-4 h-4"/>
                          Resume Your Live Session
                        </button>
                      )}
                    </div>
                  );
                }
                
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`flex gap-4 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-base font-black ring-4 ring-[#09090f] overflow-hidden shadow-2xl shrink-0">
                         {m.user?.image ? <img src={m.user.image} className="w-full h-full object-cover" /> : <span className="opacity-80">{(m.user?.name??"?")[0].toUpperCase()}</span>}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-3 mb-2 px-1">
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{m.user?.name}</span>
                          <span className="text-slate-700 text-[8px] font-black uppercase tracking-widest">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`group relative px-6 py-4 rounded-[28px] text-[15px] leading-relaxed border ${isMe ? 'bg-teal-600 border-teal-500 text-white rounded-tr-none shadow-xl shadow-teal-600/10' : 'bg-white/[0.03] border-white/5 text-slate-200 rounded-tl-none shadow-xl'}`}>
                          {m.content}
                          <ReactionList 
                            messageId={m.id} 
                            type="classroom" 
                            cohortId={initialCohort.id} 
                            reactions={m.reactions || {}} 
                            onReact={(emoji) => handleReact(m.id, emoji)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottom}/>
            </div>
            <MentionInput value={msgInput} onChange={setMsgInput} onSend={sendMsg} loading={loading} users={allUsersExceptMe}/>
          </div>
        )}

        {tab==="schedule" && (
          <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-white font-black text-3xl tracking-tight">Live Schedule</h3>
               <button onClick={()=>setShowScheduleModal(true)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/20 active:scale-[0.98] flex items-center gap-3"><Plus className="w-5 h-5"/> New Session</button>
            </div>
            <div className="space-y-6">
               {scheduledSessions.length > 0 ? scheduledSessions.map(s => (
                 <div key={s.id} className="flex items-center justify-between bg-white/[0.02] p-8 rounded-[32px] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center gap-8">
                       <div className="text-center w-20 px-3 py-5 rounded-[24px] bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                          <p className="text-[11px] text-indigo-400 font-black uppercase tracking-widest">{new Date(s.scheduledAt).toLocaleString('en-US', { month: 'short' })}</p>
                          <p className="text-3xl text-white font-black mt-1">{new Date(s.scheduledAt).getDate()}</p>
                       </div>
                       <div>
                          <p className="text-white font-black text-xl group-hover:text-indigo-400 transition-colors">{s.title}</p>
                          <p className="text-slate-500 text-sm font-black uppercase tracking-widest mt-2 flex items-center gap-2 opacity-60"><Clock className="w-4 h-4"/> {new Date(s.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • Live Broadcast</p>
                       </div>
                    </div>
                    <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all"><X className="w-5 h-5"/></button>
                 </div>
               )) : <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] opacity-40"><Calendar className="w-16 h-16 text-slate-700 mx-auto mb-6"/><p className="text-slate-600 font-black uppercase tracking-[0.2em]">No sessions scheduled</p></div>}
            </div>
          </div>
        )}

        {tab==="students" && (
          <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl">
            <h3 className="text-white font-black text-3xl mb-10 tracking-tight">Cohort Members ({students.length})</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map(u => (
                <div key={u.id} className="flex items-center gap-5 p-5 bg-white/[0.02] rounded-[28px] border border-white/5 hover:border-teal-500/30 hover:bg-white/[0.04] transition-all group shadow-lg">
                   <div className="w-16 h-16 rounded-[20px] bg-teal-600/10 border border-teal-500/10 flex items-center justify-center text-teal-400 font-black text-2xl overflow-hidden ring-4 ring-[#09090f] group-hover:ring-teal-500/20 transition-all shadow-inner">
                      {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                   </div>
                   <div className="min-w-0">
                      <p className="text-white font-black text-lg truncate group-hover:text-teal-400 transition-colors">{u.name}</p>
                      <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest mt-1">{u.studentId || (u.role === 'ADMIN' ? 'Administrator' : 'Lead Tutor')}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="curriculum" && (
          <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-white font-black text-3xl tracking-tight">Course Curriculum</h3>
               <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all text-xs uppercase tracking-widest border border-white/5 flex items-center gap-2"><Plus className="w-4 h-4"/> Add Module</button>
            </div>
            <div className="space-y-4">
              {curriculum.map((m, i) => (
                <div key={i} className="p-6 bg-white/[0.02] rounded-[24px] border border-white/5">
                   <h4 className="text-white font-black text-xl mb-4">{m.title}</h4>
                   <div className="flex items-center gap-4">
                      {m.materials.map((mat:string, idx:number) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-400 text-sm bg-white/5 px-4 py-2 rounded-xl"><BookOpen className="w-4 h-4"/> {mat}</div>
                      ))}
                      <button className="text-teal-400 hover:text-teal-300 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Upload Material</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="assignments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl">
               <div>
                  <h3 className="text-white font-black text-3xl tracking-tight mb-2">Assignments Hub</h3>
                  <p className="text-slate-500 text-sm">Deploy tasks, track submissions, and manage grading.</p>
               </div>
               <button onClick={()=>setShowAssignModal(true)} className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-teal-600/20 flex items-center gap-3"><Plus className="w-5 h-5"/> Set Assignment</button>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
               {assignments.map(a => (
                 <div key={a.id} className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 hover:border-teal-500/30 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <h4 className="text-white font-black text-xl tracking-tight">{a.title}</h4>
                          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-2"><Clock className="w-3 h-3"/> Due: {a.dueAt ? new Date(a.dueAt).toLocaleString() : 'No Deadline'}</p>
                       </div>
                       <button onClick={()=>toggleSubmissionPortal(a.id, a.isOpen)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${a.isOpen ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}>
                         {a.isOpen ? 'Portal Open (Close)' : 'Portal Closed (Open)'}
                       </button>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">{a.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                       <p className="text-teal-400 text-sm font-black flex items-center gap-2"><ClipboardList className="w-4 h-4"/> {a._count?.submissions || 0} Submissions</p>
                       <Link href={`/tutor/classroom/${initialCohort.id}/assignments/${a.id}`} className="text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1">Grade <ChevronDown className="w-4 h-4 -rotate-90"/></Link>
                    </div>
                 </div>
               ))}
               {assignments.length === 0 && <div className="lg:col-span-2 text-center py-20"><ClipboardList className="w-16 h-16 text-slate-700 mx-auto mb-6"/><p className="text-slate-600 font-black uppercase tracking-[0.2em]">No assignments deployed</p></div>}
            </div>
          </div>
        )}

        {tab==="attendance" && (
          <div className="space-y-6">
            <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 flex items-center justify-between shadow-xl">
               <div>
                  <h3 className="text-white font-black text-3xl tracking-tight mb-2">Class Attendance</h3>
                  <p className="text-slate-500 text-sm">Monitor check-ins manually. Students can only check in while a session is open.</p>
               </div>
               <button onClick={()=>toggleAttendance(activeAttendance?.id)} disabled={loading} className={`px-8 py-4 text-white font-black rounded-2xl transition-all flex items-center gap-3 ${activeAttendance ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' : 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/20'}`}>
                 {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckSquare className="w-5 h-5"/>}
                 {activeAttendance ? 'Close Attendance Portal' : 'Open Attendance Portal'}
               </button>
            </div>
            
            <div className="grid gap-4">
               {attendanceSessions.map(s => (
                 <div key={s.id} className="flex items-center justify-between p-6 bg-[#0d0d14] border border-white/5 rounded-[28px]">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><Calendar className="w-5 h-5 text-slate-400"/></div>
                       <div>
                          <p className="text-white font-black text-lg">{s.label || 'Class Session'}</p>
                          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">{new Date(s.openedAt).toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <p className="text-teal-400 font-black text-lg flex items-center gap-2"><Users className="w-5 h-5"/> {s.records?.length || 0} Present</p>
                       <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${!s.closedAt ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                         {!s.closedAt ? 'Active Now' : 'Closed'}
                       </div>
                    </div>
                 </div>
               ))}
               {attendanceSessions.length === 0 && <p className="text-center text-slate-600 font-black uppercase tracking-[0.2em] py-12">No attendance records</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
