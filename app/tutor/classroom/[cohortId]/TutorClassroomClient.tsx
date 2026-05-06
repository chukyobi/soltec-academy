"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, ClipboardList, CheckSquare, Settings, MessageSquare, Plus, X, Loader2, CheckCircle2, AlertCircle, Clock, ChevronDown, Send, Shield, UserX, UserCheck, Video, Zap, Trophy, AtSign, Image as ImageIcon, Star, Radio } from "lucide-react";
import { useClassroomPusher } from "@/hooks/useClassroomPusher";
import { MentionInput } from "@/components/classroom/MentionInput";
import { Toaster } from "react-hot-toast";

type Tab = "students"|"assignments"|"assessments"|"attendance"|"chat"|"settings";
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

export default function TutorClassroomClient({ cohort, tutorName, userId, initSettings }:Props) {
  const [tab, setTab] = useState<Tab>("chat");
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState(initSettings || { welcomeNote:"", rules:"", passThreshold:70, attendanceWeight:30, assignmentWeight:50, participationWeight:20 });
  const [showNewA, setShowNewA] = useState<{type:'assignment'|'assessment'|null} | null>(null);
  const [newA, setNewA] = useState({ title:"", description:"", dueAt:"", maxScore:100 });
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [gradingModal, setGradingModal] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState({ score:"", feedback:"" });
  const [isLive, setIsLive] = useState(cohort.isLive);
  const chatBottom = useRef<HTMLDivElement>(null);

  const fetch_ = (url:string) => fetch(url).then(r=>r.ok?r.json():[]);
  const load = useCallback(async()=>{
    if(tab==="students") setStudents(await fetch_(`/api/classroom/${cohort.id}/students`));
    if(tab==="assignments") setAssignments(await fetch_(`/api/classroom/${cohort.id}/assignments`));
    if(tab==="assessments") setAssessments(await fetch_(`/api/classroom/${cohort.id}/assessments`));
    if(tab==="attendance") setAttendance(await fetch_(`/api/classroom/${cohort.id}/attendance`));
    if(tab==="chat") {
      const msgs = await fetch_(`/api/classroom/${cohort.id}/messages`);
      setMessages(msgs);
    }
  },[tab, cohort.id]);

  useEffect(()=>{ load(); },[load]);
  useEffect(()=>{ if(tab==="chat") chatBottom.current?.scrollIntoView({behavior:"smooth"}); },[messages, tab]);

  // ── Pusher Integration ────────────────────────────────────────────────────
  useClassroomPusher(cohort.id, userId, (newMsg) => {
    setMessages(prev => {
      if (prev.find(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
  });

  async function createA(){ 
    setLoading(true); 
    const endpoint = showNewA?.type === 'assessment' ? 'assessments' : 'assignments';
    await fetch(`/api/classroom/${cohort.id}/${endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newA)}); 
    setShowNewA(null); 
    setNewA({title:"",description:"",dueAt:"",maxScore:100}); 
    load(); 
    setLoading(false); 
  }
  async function toggleAttendance(open:boolean, sessionId?:string){ await fetch(`/api/classroom/${cohort.id}/attendance`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(open?{action:"open",label:`Session ${new Date().toLocaleDateString()}`}:{action:"close",sessionId})}); load(); }
  async function toggleStatus(type:'assignments'|'assessments', id:string, isOpen:boolean){ await fetch(`/api/classroom/${cohort.id}/${type}/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isOpen})}); load(); }
  async function updateStudentStatus(userId:string, status:string){ await fetch(`/api/classroom/${cohort.id}/students`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,status})}); load(); }
  async function saveSettings(){ setLoading(true); await fetch(`/api/classroom/${cohort.id}/settings`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)}); setSettingsSaved(true); setTimeout(()=>setSettingsSaved(false),2000); setLoading(false); }
  
  async function sendMsg(){ 
    if(!msgInput.trim()) return; 
    setLoading(true);
    const mentionNames = msgInput.match(/@\w+/g)?.map(m => m.slice(1)) || [];
    const mentionIds = students
      .filter(u => mentionNames.includes(u.name.replace(/\s/g, '')))
      .map(u => u.id);

    await fetch(`/api/classroom/${cohort.id}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:msgInput, mentions: mentionIds})}); 
    setMsgInput(""); 
    setLoading(false);
  }

  async function gradeSubmission(){ if(!gradingModal) return; setLoading(true); await fetch(`/api/classroom/${cohort.id}/assignments/${gradingModal.assignmentId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({submissionId:gradingModal.id,...gradeInput,score:Number(gradeInput.score)})}); setGradingModal(null); load(); setLoading(false); }
  async function toggleLive(){ 
    setLoading(true);
    const r = await fetch(`/api/classroom/${cohort.id}/live`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({isLive: !isLive})});
    if(r.ok) setIsLive(!isLive);
    setLoading(false);
  }

  const openSession = attendance.find((s:any)=>!s.closedAt);
  const TABS = [
    {id:"chat",label:"Chat",icon:MessageSquare},
    {id:"assignments",label:"Tasks",icon:ClipboardList},
    {id:"assessments",label:"Assessments",icon:Zap},
    {id:"attendance",label:"Attendance",icon:CheckSquare},
    {id:"students",label:"Students",icon:Users},
    {id:"settings",label:"Settings",icon:Settings}
  ] as const;

  const renderContent = (content: string) => {
    return content.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-teal-400 font-bold bg-teal-500/10 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      <Toaster position="top-right" />
      {gradingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4"><h3 className="text-white font-black">Grade Submission</h3><button onClick={()=>setGradingModal(null)}><X className="w-5 h-5 text-slate-400"/></button></div>
            <p className="text-slate-400 text-sm mb-3"><strong className="text-white">{gradingModal.user?.name}</strong>: {gradingModal.content||"(file submission)"}</p>
            <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white mb-3 focus:outline-none focus:border-teal-500 text-sm" placeholder="Score" value={gradeInput.score} onChange={e=>setGradeInput(p=>({...p,score:e.target.value}))}/>
            <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white resize-none h-20 focus:outline-none focus:border-teal-500 text-sm mb-4" placeholder="Feedback (optional)" value={gradeInput.feedback} onChange={e=>setGradeInput(p=>({...p,feedback:e.target.value}))}/>
            <button onClick={gradeSubmission} disabled={loading} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-sm transition-all">{loading?<Loader2 className="w-4 h-4 animate-spin mx-auto"/>:"Save Grade"}</button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 bg-[#09090f]/90 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tutor/dashboard" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/></Link>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cohort.course.color} flex items-center justify-center`}><GraduationCap className="w-5 h-5 text-white"/></div>
            <div>
               <div className="flex items-center gap-2">
                  <p className="text-white font-black text-sm">{cohort.name}</p>
                  {isLive && <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">LIVE</span>}
               </div>
               <p className="text-slate-500 text-xs">{cohort.course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={toggleLive} 
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${isLive ? 'bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}`}
             >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : isLive ? <Radio className="w-3.5 h-3.5"/> : <Video className="w-3.5 h-3.5"/>}
                {isLive ? 'Stop Stream' : 'Start Live Class'}
             </button>
             <span className="text-[10px] bg-teal-500/20 text-teal-400 border border-teal-500/20 px-3 py-2 rounded-xl font-black uppercase tracking-widest hidden sm:block">Admin Console</span>
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

        {/* CHAT - Real Time + Mentions for Tutors */}
        {tab==="chat" && (
          <div className="flex flex-col h-[75vh] bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m:any)=>{
                const isMe = m.userId === userId;
                const isTutor = m.user?.role === "TUTOR" || m.user?.role === "ADMIN";
                
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="relative shrink-0">
                         <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${isTutor ? 'from-teal-500 to-emerald-600' : 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-xs font-black ring-2 ring-white/5 overflow-hidden shadow-lg`}>
                            {m.user?.image ? <img src={m.user.image} className="w-full h-full object-cover" /> : (m.user?.name??"?")[0].toUpperCase()}
                         </div>
                         {isTutor && <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white p-0.5 rounded-lg shadow-lg border border-slate-900"><Shield className="w-2.5 h-2.5"/></div>}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{m.user?.name}</span>
                          <span className="text-slate-600 text-[9px]">{new Date(m.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm border ${
                          isMe 
                            ? 'bg-teal-600 text-white rounded-tr-none border-teal-500 shadow-teal-500/10' 
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
               onSend={sendMsg} 
               loading={loading} 
               users={students}
            />
          </div>
        )}

        {/* ... other tabs ... */}

      </div>
    </div>
  );
}
