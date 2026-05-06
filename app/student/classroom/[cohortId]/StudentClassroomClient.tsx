"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Home, MessageSquare, ClipboardList, CheckSquare, BookOpen, Send, X, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, Users, GraduationCap, LogOut, ArrowLeft, Award, Shield, Video, Zap, Trophy, AtSign, Image as ImageIcon, Star } from "lucide-react";
import { ClassroomTour } from "@/components/student/ClassroomTour";
import { useClassroomPusher } from "@/hooks/useClassroomPusher";
import { MentionInput } from "@/components/classroom/MentionInput";
import { Toaster } from "react-hot-toast";

type Tab = "home"|"chat"|"assignments"|"assessments"|"attendance"|"curriculum";

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

function Countdown({ dueAt }:{ dueAt:string }) {
  const [left, setLeft] = useState("");
  useEffect(()=>{
    const tick=()=>{ const d=new Date(dueAt).getTime()-Date.now(); if(d<=0){setLeft("Closed");return;} const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000); setLeft(`${h}h ${m}m ${s}s`); };
    tick(); const t=setInterval(tick,1000); return ()=>clearInterval(t);
  },[dueAt]);
  return <span className={`font-mono text-xs ${left==="Closed"?"text-red-400":"text-amber-400"}`}>{left}</span>;
}

export default function StudentClassroomClient({ cohort, modules, totalLessons, studentName, studentId, userId, isFirstVisit }:Props) {
  const [tab, setTab] = useState<Tab>("home");
  const [showWelcome, setShowWelcome] = useState(isFirstVisit);
  const [runTour, setRunTour] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [classroomUsers, setClassroomUsers] = useState<any[]>([]);
  const [openSession, setOpenSession] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [submitModal, setSubmitModal] = useState<any>(null);
  const [submitContent, setSubmitContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number|null>(0);
  const [topStudents, setTopStudents] = useState<string[]>([]);
  const chatBottom = useRef<HTMLDivElement>(null);
  const s = cohort.settings;

  const fetchMessages = useCallback(async()=>{ const r=await fetch(`/api/classroom/${cohort.id}/messages`); if(r.ok) setMessages(await r.json()); },[cohort.id]);
  const fetchAssignments = useCallback(async()=>{ const r=await fetch(`/api/classroom/${cohort.id}/assignments`); if(r.ok) setAssignments(await r.json()); },[cohort.id]);
  const fetchAssessments = useCallback(async()=>{ const r=await fetch(`/api/classroom/${cohort.id}/assessments`); if(r.ok) setAssessments(await r.json()); },[cohort.id]);
  const fetchAttendance = useCallback(async()=>{ const r=await fetch(`/api/classroom/${cohort.id}/attendance`); if(r.ok){ const data=await r.json(); setAttendance(data); const open=data.find((s:any)=>!s.closedAt); setOpenSession(open||null); if(open){ setCheckedIn(open.records?.some((rec:any)=>rec.userId===userId)||false); } } },[cohort.id, userId]);
  const fetchTopStudents = useCallback(async()=>{ const r=await fetch(`/api/classroom/${cohort.id}/top-students`); if(r.ok) setTopStudents(await r.json()); },[cohort.id]);
  const fetchUsers = useCallback(async()=>{ const r=await fetch(`/api/classroom/${cohort.id}/students`); if(r.ok) setClassroomUsers(await r.json()); },[cohort.id]);

  useEffect(()=>{ fetchMessages(); },[fetchMessages]);
  useEffect(()=>{ fetchAssignments(); fetchAssessments(); fetchTopStudents(); fetchUsers(); },[fetchAssignments, fetchAssessments, fetchTopStudents, fetchUsers]);
  useEffect(()=>{ fetchAttendance(); const t=setInterval(fetchAttendance,8000); return ()=>clearInterval(t); },[fetchAttendance]);
  useEffect(()=>{ if(tab==="chat") chatBottom.current?.scrollIntoView({behavior:"smooth"}); },[messages, tab]);

  // ── Pusher Integration ────────────────────────────────────────────────────
  useClassroomPusher(cohort.id, userId, (newMsg) => {
    setMessages(prev => {
      if (prev.find(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    // Trigger rank update if message is from a system or tutor (might affect scoring)
    if (newMsg.userId === 'system') fetchTopStudents();
  });

  async function sendMessage(){ 
    if(!msgInput.trim()) return; 
    setLoading(true); 
    // Find mentioned user IDs based on names in message
    const mentionNames = msgInput.match(/@\w+/g)?.map(m => m.slice(1)) || [];
    const mentionIds = classroomUsers
      .filter(u => mentionNames.includes(u.name.replace(/\s/g, '')))
      .map(u => u.id);

    await fetch(`/api/classroom/${cohort.id}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:msgInput, mentions: mentionIds})}); 
    setMsgInput(""); 
    setLoading(false); 
  }
  async function checkIn(){ const r=await fetch(`/api/classroom/${cohort.id}/attendance`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"checkin"})}); if(r.ok) setCheckedIn(true); }
  async function submitAssignment(){ if(!submitModal||!submitContent.trim()) return; setLoading(true); await fetch(`/api/classroom/${cohort.id}/assignments/${submitModal.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:submitContent})}); setSubmitModal(null); setSubmitContent(""); fetchAssignments(); setLoading(false); }

  if(cohort.myStatus==="KICKED") return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center p-6">
      <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-10 text-center max-w-md">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4"/>
        <h2 className="text-white font-black text-2xl mb-2">Access Removed</h2>
        <p className="text-slate-400 text-sm mb-6">You have been removed from this classroom by the tutor. Contact your tutor for more information.</p>
        <Link href="/student/profile" className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const TABS=[
    {id:"home",label:"Home",icon:Home},
    {id:"chat",label:"Chat",icon:MessageSquare},
    {id:"assignments",label:"Tasks",icon:ClipboardList},
    {id:"assessments",label:"Assessments",icon:Zap},
    {id:"attendance",label:"Attendance",icon:CheckSquare},
    {id:"curriculum",label:"Curriculum",icon:BookOpen}
  ] as const;

  const renderContent = (content: string) => {
    return content.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded cursor-pointer hover:bg-indigo-500/20 transition-colors">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      <Toaster position="top-right" />
      <ClassroomTour run={runTour} onFinish={()=>setRunTour(false)}/>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#09090f]/90 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/student/profile" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/></Link>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cohort.course.color} flex items-center justify-center shrink-0`}><GraduationCap className="w-5 h-5 text-white"/></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-sm truncate">{cohort.name}</p>
                {cohort.isLive && <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse"><Video className="w-3 h-3"/>LIVE</span>}
              </div>
              <p className="text-slate-500 text-xs truncate">{cohort.course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {cohort.isLive && (
              <button onClick={() => setTab("chat")} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all">
                <Video className="w-4 h-4"/> Join Live
              </button>
            )}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right"><p className="text-white font-black text-sm">{cohort.totalStudents}</p><p className="text-slate-500 text-[10px] uppercase font-bold">Students</p></div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5 bg-[#09090f]/80 backdrop-blur sticky top-[61px] z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto flex overflow-x-auto no-scrollbar">
          {TABS.map(({id,label,icon:Icon})=>(
            <button key={id} id={`tab-${id}`} onClick={()=>setTab(id as Tab)} className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${tab===id?"border-indigo-500 text-white":"border-transparent text-slate-500 hover:text-slate-300"}`}>
              <Icon className="w-3.5 h-3.5"/>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        
        {/* LIVE VIEW OVERLAY in Chat Tab */}
        {tab==="chat" && cohort.isLive && (
          <div className="mb-6 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
            <div className="absolute inset-0 bg-black flex items-center justify-center">
               <div className="text-center">
                 <Video className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse"/>
                 <p className="text-white font-black">Live Class in Progress</p>
                 <p className="text-slate-500 text-sm mt-1">Connecting to stream...</p>
                 <button className="mt-6 px-6 py-3 bg-white text-black font-black rounded-xl text-sm hover:scale-105 transition-all">Connect Audio & Video</button>
               </div>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"/> Live
            </div>
          </div>
        )}

        {/* HOME */}
        {tab==="home" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700"/>
              <div className="relative">
                <h2 className="text-white font-black text-3xl mb-2">Welcome, {studentName.split(' ')[0]}! 🚀</h2>
                <p className="text-white/80 text-sm max-w-md">Continue your journey in <strong className="text-white">{cohort.course.title}</strong>. You're part of an elite group of {cohort.totalStudents} students.</p>
                <div className="flex items-center gap-4 mt-6">
                   <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/10 text-center">
                      <p className="text-white font-black text-xl leading-none">{totalLessons}</p>
                      <p className="text-white/60 text-[10px] uppercase font-bold mt-1">Lessons</p>
                   </div>
                   <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/10 text-center">
                      <p className="text-white font-black text-xl leading-none">3</p>
                      <p className="text-white/60 text-[10px] uppercase font-bold mt-1">Months</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 {s && (
                   <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6">
                      <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-amber-400"/>Graduation Track</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          {label:"Pass threshold",val:`${s.passThreshold}%`,icon:Trophy,color:"text-indigo-400"},
                          {label:"Attendance",val:`${s.attendanceWeight}%`,icon:CheckSquare,color:"text-green-400"},
                          {label:"Assignments",val:`${s.assignmentWeight}%`,icon:ClipboardList,color:"text-blue-400"},
                          {label:"Participation",val:`${s.participationWeight}%`,icon:Star,color:"text-purple-400"}
                        ].map(r=>(
                          <div key={r.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                             <div className={`p-2 rounded-xl bg-white/5 ${r.color}`}><r.icon className="w-4 h-4"/></div>
                             <div><p className="text-slate-400 text-[10px] uppercase font-bold">{r.label}</p><p className="text-white font-black">{r.val}</p></div>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
              <div className="space-y-6">
                 <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-black text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500"/>Elite Hall</h3>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-amber-500/20">Dynamic Rank</span>
                    </div>
                    <div className="space-y-3">
                       {topStudents.length > 0 ? topStudents.map((tId, i) => {
                         const user = classroomUsers.find(u => u.id === tId);
                         return (
                           <div key={tId} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5 group hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${i===0?'from-amber-400 to-amber-600':'from-slate-400 to-slate-600'} flex items-center justify-center shadow-lg`}>
                                   {user?.image ? <img src={user.image} className="w-full h-full object-cover rounded-xl" /> : <Trophy className="w-5 h-5 text-white"/>}
                                 </div>
                                 <div><p className="text-white text-sm font-bold">{user?.name || "Student"}</p><p className="text-slate-500 text-[10px] uppercase font-black">Rank #{i+1}</p></div>
                              </div>
                              <Zap className="w-4 h-4 text-amber-500 group-hover:animate-pulse"/>
                           </div>
                         );
                       }) : (
                         <div className="text-center py-6">
                            <Star className="w-8 h-8 text-slate-800 mx-auto mb-2"/>
                            <p className="text-slate-600 text-xs italic">Hall is currently empty. Reach the threshold to claim your spot!</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAT - Real Time + Mentions */}
        {tab==="chat" && (
          <div className="flex flex-col h-[75vh] bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m:any)=>{
                const isMe = m.userId === userId;
                const isTutor = m.user?.role === "TUTOR" || m.user?.role === "ADMIN";
                const isTop = topStudents.includes(m.userId);

                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="relative shrink-0">
                         <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${isTutor ? 'from-teal-500 to-emerald-600' : 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-xs font-black ring-2 ring-white/5 overflow-hidden shadow-lg`}>
                            {m.user?.image ? <img src={m.user.image} className="w-full h-full object-cover" /> : (m.user?.name??"?")[0].toUpperCase()}
                         </div>
                         {isTutor && <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white p-0.5 rounded-lg shadow-lg border border-slate-900"><Shield className="w-2.5 h-2.5"/></div>}
                         {isTop && !isTutor && <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-lg shadow-lg border border-slate-900"><Trophy className="w-2.5 h-2.5"/></div>}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{m.user?.name}</span>
                          <span className="text-slate-600 text-[9px]">{new Date(m.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm border ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500 shadow-indigo-500/10' 
                            : 'bg-white/5 text-slate-300 rounded-tl-none border-white/5'
                        }`}>
                          {renderContent(m.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottom}/>
            </div>
            
            <MentionInput 
               value={msgInput} 
               onChange={setMsgInput} 
               onSend={sendMessage} 
               loading={loading} 
               users={classroomUsers}
            />
          </div>
        )}

        {/* ... other tabs ... */}

      </div>
    </div>
  );
}
