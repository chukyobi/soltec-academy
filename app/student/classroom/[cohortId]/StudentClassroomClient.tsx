"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Home, MessageSquare, ClipboardList, CheckSquare, BookOpen, Send, X, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, Users, GraduationCap, LogOut, ArrowLeft, Award, Shield, Video, Zap, Trophy, AtSign, Image as ImageIcon, Star, Calendar } from "lucide-react";
import { ClassroomTour } from "@/components/student/ClassroomTour";
import { useClassroomPusher } from "@/hooks/useClassroomPusher";
import { MentionInput } from "@/components/classroom/MentionInput";
import { LiveClassroom } from "@/components/classroom/LiveClassroom";
import { Toaster, toast } from "react-hot-toast";

type Tab = "home"|"chat"|"assignments"|"assessments"|"attendance"|"curriculum"|"students";

interface Settings { welcomeNote:string|null; rules:string|null; passThreshold:number; attendanceWeight:number; assignmentWeight:number; participationWeight:number; }
interface Cohort { 
  id:string; 
  name:string; 
  startDate:string|null; 
  endDate:string|null; 
  totalStudents:number; 
  tutors:{id: string; name:string|null; image?:string|null}[]; 
  course:{title:string;slug:string;color:string;level:string;duration:string}; 
  settings:Settings|null; 
  myStatus:"ACTIVE"|"SUSPENDED"|"KICKED"|null;
  isLive: boolean;
  liveRoomId: string|null;
}
interface Props { cohort:Cohort; modules:{title:string;lessons:{title:string}[]}[]; totalLessons:number; studentName:string; studentId:string; userId:string; isFirstVisit:boolean; }

export default function StudentClassroomClient({ cohort: initialCohort, modules, totalLessons, studentName, studentId, userId, isFirstVisit }:Props) {
  const [tab, setTab] = useState<Tab>("home");
  const [isLive, setIsLive] = useState(initialCohort.isLive);
  const [liveToken, setLiveToken] = useState<string|null>(null);
  const [joiningLive, setJoiningLive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(isFirstVisit);
  const [runTour, setRunTour] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [classroomUsers, setClassroomUsers] = useState<any[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const chatBottom = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async()=>{ const r=await fetch(`/api/classroom/${initialCohort.id}/messages`); if(r.ok) setMessages(await r.json()); },[initialCohort.id]);
  const fetchUsers = useCallback(async()=>{ const r=await fetch(`/api/classroom/${initialCohort.id}/students`); if(r.ok) setClassroomUsers(await r.json()); },[initialCohort.id]);
  const fetchSchedules = useCallback(async()=>{ const r=await fetch(`/api/classroom/${initialCohort.id}/live-sessions`); if(r.ok) setScheduledSessions(await r.json()); },[initialCohort.id]);
  const fetchTopStudents = useCallback(async()=>{ const r=await fetch(`/api/classroom/${initialCohort.id}/top-students`); if(r.ok) setTopStudents(await r.json()); },[initialCohort.id]);

  useEffect(()=>{ fetchMessages(); fetchUsers(); fetchSchedules(); fetchTopStudents(); }, [fetchMessages, fetchUsers, fetchSchedules, fetchTopStudents]);
  useEffect(()=>{ if(tab==="chat") chatBottom.current?.scrollIntoView({behavior:"smooth"}); },[messages, tab]);

  useClassroomPusher(initialCohort.id, userId, (newMsg) => {
    setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
    if (newMsg.userId === 'system') fetchTopStudents();
  }, (liveStatus) => {
    setIsLive(liveStatus);
    if (!liveStatus) setLiveToken(null);
  });

  async function joinLive(){
    setJoiningLive(true);
    const r = await fetch(`/api/classroom/${initialCohort.id}/live/token`);
    if(r.ok){
      const { token } = await r.json();
      setLiveToken(token);
    } else {
      toast.error("Failed to join live session. Please try again.");
    }
    setJoiningLive(false);
  }

  async function sendMessage(){ 
    if(!msgInput.trim()) return; 
    setLoading(true); 
    const mentionNames = msgInput.match(/@\w+/g)?.map(m => m.slice(1)) || [];
    const mentionIds = classroomUsers.filter(u => mentionNames.includes(u.name.replace(/\s/g, ''))).map(u => u.id);
    await fetch(`/api/classroom/${initialCohort.id}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:msgInput, mentions: mentionIds})}); 
    setMsgInput(""); 
    setLoading(false); 
  }

  const TABS=[
    {id:"home",label:"Home",icon:Home},
    {id:"chat",label:"Chat",icon:MessageSquare},
    {id:"assignments",label:"Tasks",icon:ClipboardList},
    {id:"assessments",label:"Assessments",icon:Zap},
    {id:"curriculum",label:"Curriculum",icon:BookOpen},
    {id:"students",label:"Classmates",icon:Users}
  ] as const;

  // Filter users for mentions: everyone except self
  const mentionableUsers = classroomUsers.filter(u => u.id !== userId);

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      <Toaster position="top-right" />
      <ClassroomTour run={runTour} onFinish={()=>setRunTour(false)}/>

      <header className="sticky top-0 z-20 bg-[#09090f]/90 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/student/profile" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/></Link>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${initialCohort.course.color} flex items-center justify-center shrink-0`}><GraduationCap className="w-5 h-5 text-white"/></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-sm truncate">{initialCohort.name}</p>
                {isLive && <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse"><Video className="w-3 h-3"/>LIVE</span>}
              </div>
              <p className="text-slate-500 text-xs truncate">{initialCohort.course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isLive && !liveToken && (
              <button onClick={joinLive} disabled={joiningLive} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-red-500/20">
                {joiningLive ? <Loader2 className="w-4 h-4 animate-spin"/> : <Video className="w-4 h-4"/>}
                Join Live Class
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 bg-[#09090f]/80 backdrop-blur sticky top-[61px] z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto flex overflow-x-auto no-scrollbar">
          {TABS.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setTab(id as Tab)} className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${tab===id?"border-indigo-500 text-white":"border-transparent text-slate-500 hover:text-slate-300"}`}>
              <Icon className="w-3.5 h-3.5"/>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        
        {/* VIDEO CONFERENCING AREA */}
        {isLive && liveToken && (
          <div className="mb-8 animate-in zoom-in-95 duration-500">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                   <h3 className="text-white font-black text-sm uppercase tracking-widest">Live Interactive Session</h3>
                </div>
                <button onClick={()=>setLiveToken(null)} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"><X className="w-4 h-4"/> Minimize</button>
             </div>
             <LiveClassroom roomName={`classroom-${initialCohort.id}`} token={liveToken} onLeave={()=>setLiveToken(null)}/>
          </div>
        )}

        {tab==="home" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700"/>
              <div className="relative">
                <h2 className="text-white font-black text-3xl mb-2">Welcome back, {studentName.split(' ')[0]}! 🚀</h2>
                <p className="text-white/80 text-sm max-w-md">The classroom is active. Check the schedule for upcoming live sessions.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6">
                    <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400"/>Live Schedule</h3>
                    <div className="space-y-3">
                       {scheduledSessions.length > 0 ? scheduledSessions.map(s => (
                         <div key={s.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex flex-col items-center justify-center border border-indigo-500/20">
                                  <span className="text-[10px] text-indigo-400 font-black uppercase">{new Date(s.scheduledAt).toLocaleString('en-US', { month: 'short' })}</span>
                                  <span className="text-lg text-white font-black leading-none">{new Date(s.scheduledAt).getDate()}</span>
                               </div>
                               <div>
                                  <p className="text-white font-bold">{s.title}</p>
                                  <p className="text-slate-500 text-xs flex items-center gap-2"><Clock className="w-3 h-3"/> {new Date(s.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • {s.tutor?.name}</p>
                               </div>
                            </div>
                            <Video className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-colors"/>
                         </div>
                       )) : (
                         <p className="text-slate-600 text-sm italic py-4">No sessions scheduled yet.</p>
                       )}
                    </div>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6">
                    <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500"/>Elite Hall</h3>
                    <div className="space-y-3">
                       {topStudents.length > 0 ? topStudents.map((tId, i) => {
                         const user = classroomUsers.find(u => u.id === tId);
                         return (
                           <div key={tId} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${i===0?'from-amber-400 to-amber-600':'from-slate-400 to-slate-600'} flex items-center justify-center overflow-hidden`}>
                                   {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : (user?.name??"?")[0].toUpperCase()}
                                 </div>
                                 <div><p className="text-white text-sm font-bold truncate max-w-[100px]">{user?.name || "Student"}</p></div>
                              </div>
                              {i===0 && <Trophy className="w-4 h-4 text-amber-500"/>}
                           </div>
                         );
                       }) : <p className="text-slate-600 text-[10px] text-center italic py-4">Ranking will appear soon...</p>}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {tab==="chat" && (
          <div className="flex flex-col h-[75vh] bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m:any)=>{
                const isMe = m.userId === userId;
                const isSystem = m.userId === 'system';
                if (isSystem) return (
                  <div key={m.id} className="flex justify-center animate-in fade-in zoom-in-95">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{m.content}</div>
                  </div>
                );
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center text-white text-xs font-black overflow-hidden ring-1 ring-white/10 shrink-0 shadow-lg">
                        {m.user?.image ? <img src={m.user.image} className="w-full h-full object-cover" /> : (m.user?.name??"?")[0].toUpperCase()}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-slate-500 text-[10px] font-black uppercase mb-1">{m.user?.name}</span>
                        <div className={`px-4 py-3 rounded-3xl text-sm border ${isMe ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-slate-300 rounded-tl-none'}`}>
                           {m.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottom}/>
            </div>
            <MentionInput value={msgInput} onChange={setMsgInput} onSend={sendMessage} loading={loading} users={mentionableUsers}/>
          </div>
        )}

        {tab==="students" && (
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-8">
            <h3 className="text-white font-black text-2xl mb-6">Classmates</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classroomUsers.map(u => (
                <div key={u.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black text-lg overflow-hidden ring-2 ring-white/5 group-hover:ring-indigo-500/50 transition-all">
                      {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                   </div>
                   <div>
                      <p className="text-white font-bold">{u.name}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5">
                        {u.role === 'TUTOR' ? <Shield className="w-3 h-3 text-teal-400"/> : <GraduationCap className="w-3 h-3 text-indigo-400"/>}
                        {u.role}
                      </p>
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
