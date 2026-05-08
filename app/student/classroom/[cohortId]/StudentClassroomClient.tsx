'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Home, MessageSquare, ClipboardList, CheckSquare, BookOpen, Send, X, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, Users, GraduationCap, LogOut, ArrowLeft, Award, Shield, Video, Zap, Trophy, AtSign, Image as ImageIcon, Star, Calendar, Bell } from "lucide-react";
import { ClassroomTour } from "@/components/student/ClassroomTour";
import { useClassroomPusher } from "@/hooks/useClassroomPusher";
import { MentionInput } from "@/components/classroom/MentionInput";
import { LiveClassroom } from "@/components/classroom/LiveClassroom";
import { ReactionList } from "@/components/classroom/ReactionList";
import { Toaster, toast } from "react-hot-toast";
import { UserMenu } from "@/components/UserMenu";

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
interface Props { 
  cohort:Cohort; 
  modules:{title:string;lessons:{title:string}[]}[]; 
  totalLessons:number; 
  studentName:string; 
  studentId:string; 
  userId:string; 
  userEmail:string;
  userImage?:string|null;
  isFirstVisit:boolean; 
}

export default function StudentClassroomClient({ 
  cohort: initialCohort, modules, totalLessons, 
  studentName, studentId, userId, userEmail, userImage, isFirstVisit 
}:Props) {
  const [tab, setTab] = useState<Tab>("home");
  const [isLive, setIsLive] = useState(initialCohort.isLive);
  const [liveToken, setLiveToken] = useState<string|null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string|null>(initialCohort.liveRoomId);
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

  const fetchMessages = useCallback(async()=>{ 
    const r=await fetch(`/api/classroom/${initialCohort.id}/messages`); 
    if(r.ok) setMessages(await r.json()); 
  },[initialCohort.id]);
  
  const fetchUsers = useCallback(async()=>{ 
    const r=await fetch(`/api/classroom/${initialCohort.id}/students`); 
    if(r.ok) setClassroomUsers(await r.json()); 
  },[initialCohort.id]);

  const fetchSchedules = useCallback(async()=>{
    const r = await fetch(`/api/classroom/${initialCohort.id}/sessions`);
    if(r.ok) setScheduledSessions(await r.json());
  },[initialCohort.id]);

  const fetchTopStudents = useCallback(async()=>{
    const r = await fetch(`/api/classroom/${initialCohort.id}/leaderboard`);
    if(r.ok) { const data = await r.json(); setTopStudents(data.map((u:any)=>u.id)); }
  },[initialCohort.id]);

  const fetchAssignments = useCallback(async()=>{
    const r = await fetch(`/api/classroom/${initialCohort.id}/assignments`);
    if(r.ok) setAssignments(await r.json());
  },[initialCohort.id]);

  const fetchAttendance = useCallback(async()=>{
    const r = await fetch(`/api/classroom/${initialCohort.id}/attendance`);
    if(r.ok) setAttendance(await r.json());
  },[initialCohort.id]);

  useEffect(()=>{ 
    fetchMessages(); fetchUsers(); fetchSchedules(); fetchTopStudents(); 
    if(tab==="assignments") fetchAssignments();
    if(tab==="attendance") fetchAttendance();
  }, [fetchMessages, fetchUsers, fetchSchedules, fetchTopStudents, fetchAssignments, fetchAttendance, tab]);

  useClassroomPusher(
    initialCohort.id, 
    userId, 
    (newMsg) => {
      setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
    }, 
    (liveStatus) => {
      setIsLive(liveStatus);
      if (!liveStatus) {
        setLiveToken(null);
        setActiveSessionId(null);
      }
    },
    (reactionData) => {
      setMessages(prev => prev.map(m => {
        if (m.id === reactionData.messageId) {
          // If the message has no reactions yet, create the object
          return { ...m, reactions: reactionData.counts };
        }
        return m;
      }));
    }
  );

  // Handle reaction updates from Pusher
  useEffect(() => {
    // This would be handled inside useClassroomPusher or a similar hook
    // Simplified for this implementation
  }, []);

  async function joinLive(){
    setJoiningLive(true);
    const r = await fetch(`/api/classroom/${initialCohort.id}/live/token`);
    if(r.ok){
      const { token, sessionId } = await r.json();
      setLiveToken(token);
      setActiveSessionId(sessionId);
      // Notify join
      await fetch(`/api/classroom/${initialCohort.id}/live-sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "join" })
      });
    } else {
      toast.error("Failed to join live session.");
    }
    setJoiningLive(false);
  }

  async function leaveLive(){
    if (activeSessionId) {
      await fetch(`/api/classroom/${initialCohort.id}/live-sessions/${activeSessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "leave" })
      });
    }
    setLiveToken(null);
  }

  async function sendMessage(){ 
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

  async function submitAssignment(assignmentId: string) {
    setLoading(true);
    // Simulating a file/link submission here. A real implementation would upload the file first.
    const r = await fetch(`/api/classroom/${initialCohort.id}/assignments/${assignmentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: "https://example.com/submission", link: "https://github.com/student/project" })
    });
    if(r.ok) {
       toast.success("Assignment Submitted Successfully!");
       fetchAssignments();
    } else {
       toast.error("Failed to submit assignment");
    }
    setLoading(false);
  }

  async function checkInAttendance() {
    setLoading(true);
    const r = await fetch(`/api/classroom/${initialCohort.id}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkin" })
    });
    if(r.ok) {
       toast.success("Checked in successfully!");
       fetchAttendance();
    } else {
       const err = await r.json();
       toast.error(err.error || "Failed to check in");
    }
    setLoading(false);
  }

  const TABS = liveToken ? [
    {id:"home" as Tab,label:"Overview",icon:Home},
    {id:"assignments" as Tab,label:"Tasks",icon:ClipboardList},
    {id:"students" as Tab,label:"Members",icon:Users}
  ] : [
    {id:"home" as Tab,label:"Home",icon:Home},
    {id:"chat" as Tab,label:"Global Chat",icon:MessageSquare},
    {id:"curriculum" as Tab,label:"Curriculum",icon:BookOpen},
    {id:"assignments" as Tab,label:"Assignments",icon:ClipboardList},
    {id:"attendance" as Tab,label:"Attendance",icon:CheckSquare},
    {id:"assessments" as Tab,label:"Assessments",icon:Zap},
    {id:"students" as Tab,label:"Classmates",icon:Users}
  ];

  const mentionableUsers = classroomUsers.filter(u => u.id !== userId);
  const displayUsers = classroomUsers.filter(u => u.id !== userId);

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      <Toaster position="top-right" />
      <ClassroomTour run={runTour} onFinish={()=>setRunTour(false)}/>

      <header className="sticky top-0 z-20 bg-[#09090f]/95 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/student/profile" className="text-slate-500 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
            </Link>
            <Link href="/"><img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto brightness-0 invert" /></Link>
            <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-white font-black text-lg truncate tracking-tight">{initialCohort.name}</p>
                {isLive && <span className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black rounded-full animate-pulse uppercase tracking-[0.2em]">Live Now</span>}
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] truncate opacity-60">{initialCohort.course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all relative">
               <Bell className="w-5 h-5" />
               <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#09090f]" />
            </button>
            
            <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

            <UserMenu 
              user={{ name: studentName, email: userEmail, image: userImage }} 
              role="student" 
            />

            {isLive && !liveToken && (
              <button onClick={joinLive} disabled={joiningLive} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-2xl shadow-red-500/20 active:scale-95">
                {joiningLive ? <Loader2 className="w-4 h-4 animate-spin"/> : <Video className="w-5 h-5"/>}
                Join Stream
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 bg-[#09090f]/90 backdrop-blur-md sticky top-[77px] z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto flex overflow-x-auto no-scrollbar px-2">
          {TABS.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setTab(id as Tab)} className={`flex items-center gap-2 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap border-b-2 transition-all ${tab===id?"border-indigo-500 text-white":"border-transparent text-slate-500 hover:text-slate-300"}`}>
              <Icon className="w-4 h-4"/>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        
        {isLive && liveToken && (
          <div className="mb-12 animate-in zoom-in-95 duration-500">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"/>
                   <h3 className="text-white font-black text-base uppercase tracking-[0.2em]">Interactive Class Session</h3>
                </div>
                <button onClick={leaveLive} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5"><X className="w-4 h-4"/> Exit Stream</button>
             </div>
             <LiveClassroom roomName={`classroom-${initialCohort.id}`} token={liveToken} onLeave={leaveLive}/>
          </div>
        )}

        {tab==="home" && (
          <div className="space-y-10">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 rounded-[40px] p-12 relative overflow-hidden group shadow-2xl shadow-indigo-500/20 border border-white/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-125 transition-transform duration-1000"/>
              <div className="relative">
                <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest mb-6 border border-white/20">Active Enrollment</div>
                <h2 className="text-white font-black text-4xl sm:text-5xl mb-4 tracking-tighter">Ready to learn,<br/>{studentName.split(' ')[0]}? 🚀</h2>
                <p className="text-white/70 text-lg max-w-md font-medium leading-relaxed">Your curriculum is waiting. Join the live sessions to interact with your mentors.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                 <div className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-white font-black text-xl flex items-center gap-3 uppercase tracking-widest"><Calendar className="w-6 h-6 text-indigo-500"/>Upcoming Classes</h3>
                       <div className="h-px flex-1 bg-white/5 mx-6" />
                    </div>
                    <div className="space-y-4">
                       {scheduledSessions.length > 0 ? scheduledSessions.map(s => (
                         <div key={s.id} className="flex items-center justify-between bg-white/[0.02] p-6 rounded-[24px] border border-white/5 group hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex flex-col items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500/20 transition-colors">
                                  <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{new Date(s.scheduledAt).toLocaleString('en-US', { month: 'short' })}</span>
                                  <span className="text-2xl text-white font-black leading-none mt-0.5">{new Date(s.scheduledAt).getDate()}</span>
                               </div>
                               <div>
                                  <p className="text-white font-black text-lg group-hover:text-indigo-400 transition-colors">{s.title}</p>
                                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1 flex items-center gap-2 opacity-60"><Clock className="w-3.5 h-3.5"/> {new Date(s.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • {s.tutor?.name}</p>
                               </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-700 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                               <Video className="w-5 h-5"/>
                            </div>
                         </div>
                       )) : (
                         <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                            <p className="text-slate-600 text-xs font-black uppercase tracking-[0.2em]">No sessions scheduled</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
              
              <div className="space-y-10">
                 <div className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 shadow-xl">
                    <h3 className="text-white font-black text-xl mb-8 flex items-center gap-3 uppercase tracking-widest"><Trophy className="w-6 h-6 text-amber-500"/>Elite Hall</h3>
                    <div className="space-y-4">
                       {topStudents.length > 0 ? topStudents.map((tId, i) => {
                         const user = classroomUsers.find(u => u.id === tId);
                         return (
                           <div key={tId} className="flex items-center justify-between bg-white/[0.02] p-4 rounded-[20px] border border-white/5 hover:bg-white/[0.04] transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${i===0?'from-amber-400 to-orange-600 shadow-amber-500/20':'from-slate-600 to-slate-800 shadow-lg'} flex items-center justify-center overflow-hidden border border-white/10 group-hover:scale-105 transition-transform`}>
                                   {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <span className="font-black text-white text-lg">{(user?.name??"?")[0]}</span>}
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-white text-sm font-black truncate">{user?.name || "Student"}</p>
                                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rank #{i+1}</p>
                                 </div>
                              </div>
                              {i===0 && <Trophy className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"/>}
                           </div>
                         );
                       }) : <p className="text-slate-700 text-[10px] font-black uppercase text-center italic py-8 tracking-widest">Calculating Hall of Fame...</p>}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {tab==="chat" && (
          <div className="flex flex-col h-[75vh] bg-[#0d0d14] border border-white/5 rounded-[40px] overflow-hidden relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {messages.map((m:any)=>{
                const isMe = m.userId === userId;
                const isSystem = m.userId === 'system';
                if (isSystem) {
                  const hasJoinLink = m.content.includes('[JOIN_LIVE_STREAM]');
                  const cleanContent = m.content.replace('[JOIN_LIVE_STREAM]', '');
                  
                  return (
                    <div key={m.id} className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                        {cleanContent}
                      </div>
                      {hasJoinLink && !liveToken && isLive && (
                        <button 
                          onClick={joinLive}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-500/40 animate-bounce active:scale-95 transition-all"
                        >
                          <Video className="w-4 h-4"/>
                          Join Live Session Now
                        </button>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`flex gap-4 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-base font-black overflow-hidden ring-4 ring-[#09090f] shrink-0 shadow-2xl">
                        {m.user?.image ? <img src={m.user.image} className="w-full h-full object-cover" /> : <span className="opacity-80">{(m.user?.name??"?")[0].toUpperCase()}</span>}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-3 mb-2 px-1">
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{m.user?.name}</span>
                          <span className="text-slate-700 text-[8px] font-black uppercase tracking-widest">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`group relative px-6 py-4 rounded-[28px] text-[15px] leading-relaxed border ${isMe ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none shadow-xl shadow-indigo-600/10' : 'bg-white/[0.03] border-white/5 text-slate-200 rounded-tl-none shadow-xl'}`}>
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
            <MentionInput value={msgInput} onChange={setMsgInput} onSend={sendMessage} loading={loading} users={mentionableUsers}/>
          </div>
        )}

        {tab==="students" && (
          <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-12 shadow-xl">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-white font-black text-3xl tracking-tight">Class Community</h3>
              <div className="px-5 py-2 bg-white/5 rounded-2xl text-slate-500 text-xs font-black uppercase tracking-widest border border-white/5">
                {displayUsers.length} Members
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayUsers.map(u => (
                <div key={u.id} className="flex items-center gap-5 p-5 bg-white/[0.02] rounded-[28px] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group shadow-lg">
                   <div className="w-16 h-16 rounded-[20px] bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-black text-2xl overflow-hidden ring-4 ring-[#09090f] group-hover:ring-indigo-500/20 transition-all shadow-inner">
                      {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                   </div>
                   <div className="min-w-0">
                      <p className="text-white font-black text-lg truncate group-hover:text-indigo-400 transition-colors">{u.name}</p>
                      <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 mt-1">
                        {u.role === 'TUTOR' ? <Shield className="w-3.5 h-3.5 text-teal-500"/> : <GraduationCap className="w-3.5 h-3.5 text-indigo-500"/>}
                        {u.role}
                      </p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="curriculum" && (
          <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-12 shadow-xl">
             <h3 className="text-white font-black text-3xl mb-10 tracking-tight">Course Modules</h3>
             <div className="space-y-6">
                {modules.map((m, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[28px] p-8 hover:bg-white/[0.04] transition-all">
                     <h4 className="text-white font-black text-xl mb-4 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">{i+1}</div> {m.title}</h4>
                     <div className="grid sm:grid-cols-2 gap-4">
                        {m.lessons.map((l, j) => (
                           <div key={j} className="flex items-center gap-3 bg-[#09090f] p-4 rounded-xl border border-white/5">
                              <BookOpen className="w-4 h-4 text-slate-500"/>
                              <span className="text-slate-300 text-sm font-medium">{l.title}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {tab==="assignments" && (
          <div className="space-y-8">
             <h3 className="text-white font-black text-3xl tracking-tight px-4">My Assignments</h3>
             <div className="grid lg:grid-cols-2 gap-6">
                {assignments.map(a => {
                   const isSubmitted = a.submissions?.length > 0;
                   return (
                     <div key={a.id} className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl">
                        {!a.isOpen && <div className="absolute inset-0 bg-[#0d0d14]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center"><CheckCircle2 className="w-12 h-12 text-slate-600 mb-2"/><p className="text-slate-400 font-black uppercase tracking-widest text-xs">Submission Closed</p></div>}
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <h4 className="text-white font-black text-2xl tracking-tight">{a.title}</h4>
                              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500"/> Due: {a.dueAt ? new Date(a.dueAt).toLocaleString() : 'No Deadline'}</p>
                           </div>
                           {isSubmitted ? (
                              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Submitted</span>
                           ) : (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Pending</span>
                           )}
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">{a.description}</p>
                        
                        {!isSubmitted && a.isOpen && (
                           <div className="pt-6 border-t border-white/5 space-y-4">
                              <div className="flex gap-4">
                                 <input type="text" placeholder="Link to work (e.g. GitHub)" className="flex-1 bg-[#09090f] border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500"/>
                                 <input type="file" className="text-slate-400 text-xs w-[120px] file:mr-0 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"/>
                              </div>
                              <button onClick={()=>submitAssignment(a.id)} disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Send className="w-4 h-4"/> Submit Assignment</>}
                              </button>
                           </div>
                        )}
                     </div>
                   );
                })}
                {assignments.length === 0 && <div className="lg:col-span-2 text-center py-20"><ClipboardList className="w-16 h-16 text-slate-700 mx-auto mb-6"/><p className="text-slate-600 font-black uppercase tracking-[0.2em]">No assignments yet</p></div>}
             </div>
          </div>
        )}

        {tab==="attendance" && (
          <div className="space-y-6">
             <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-12 shadow-xl flex items-center justify-between">
                <div>
                   <h3 className="text-white font-black text-3xl tracking-tight mb-2">Class Attendance</h3>
                   <p className="text-slate-500 text-sm">Check in when a live session is active.</p>
                </div>
                <button onClick={checkInAttendance} disabled={loading} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckSquare className="w-5 h-5"/>} Check In Now
                </button>
             </div>
             
             <div className="grid gap-4">
                {attendance.map(s => {
                   const isPresent = s.records?.some((r:any) => r.user?.id === userId);
                   return (
                     <div key={s.id} className="flex items-center justify-between p-6 bg-[#0d0d14] border border-white/5 rounded-[28px] hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><Calendar className="w-5 h-5 text-slate-400"/></div>
                           <div>
                              <p className="text-white font-black text-lg">{s.label || 'Class Session'}</p>
                              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">{new Date(s.openedAt).toLocaleString()}</p>
                           </div>
                        </div>
                        <div className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isPresent ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                           {isPresent ? <><CheckCircle2 className="w-4 h-4"/> Present</> : <><Clock className="w-4 h-4"/> Absent / Missed</>}
                        </div>
                     </div>
                   );
                })}
                {attendance.length === 0 && <p className="text-center text-slate-600 font-black uppercase tracking-[0.2em] py-12">No attendance records</p>}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
