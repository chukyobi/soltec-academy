"use client";

import { useState } from "react";
import {
  Users, BookOpen, ClipboardList, MessageSquare,
  BarChart2, CheckCircle2, AlertCircle, Clock,
  UserCheck, FileCheck2, Award, ChevronDown, ChevronUp,
  Loader2, Send, Plus, X
} from "lucide-react";

interface Student {
  id: string; name: string | null; email: string; createdAt: string;
  paymentStatus: string; amountPaid: number; totalAmount: number;
}

interface Submission { id: string; fileUrl: string | null; grade: string | null; user: { id: string; name: string | null; email: string }; }
interface Assignment { id: string; title: string; description: string; submissions: Submission[]; }
interface Module { id: string; title: string; videos: { id: string; title: string; duration: string; isFree: boolean }[]; }

interface Props {
  cohort: {
    id: string; name: string; maxStudents: number;
    enrollments: (Student & { paymentStatus: string; amountPaid: number; totalAmount: number })[];
    assignments: Assignment[];
    course: { title: string; slug: string; color: string };
  };
  modules: Module[];
}

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-400 border-green-500/20",
  PARTIAL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  UNPAID: "bg-red-500/10 text-red-400 border-red-500/20",
};

function fmtNGN(n: number) { return `₦${n.toLocaleString("en-NG")}`; }

export default function TutorClassroomClient({ cohort, modules }: Props) {
  const [tab, setTab] = useState<"students" | "curriculum" | "assignments" | "announce">("students");
  const [openModule, setOpenModule] = useState<string | null>(modules[0]?.id ?? null);
  const [announce, setAnnounce] = useState("");
  const [announcements, setAnnouncements] = useState<{ text: string; time: string }[]>([
    { text: "Welcome to the cohort! First session starts this Monday at 6 PM.", time: new Date().toLocaleString() },
  ]);
  const [newAssTitle, setNewAssTitle] = useState("");
  const [newAssDesc, setNewAssDesc] = useState("");
  const [savingAss, setSavingAss] = useState(false);
  const [assError, setAssError] = useState<string | null>(null);
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>(cohort.assignments);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState("");

  const tabs = [
    { id: "students", label: "Students", icon: Users },
    { id: "curriculum", label: "Curriculum", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "announce", label: "Announcements", icon: MessageSquare },
  ] as const;

  async function postAssignment(e: React.FormEvent) {
    e.preventDefault(); setSavingAss(true); setAssError(null);
    const res = await fetch("/api/tutor/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohortId: cohort.id, title: newAssTitle, description: newAssDesc }),
    });
    const data = await res.json();
    if (!res.ok) { setAssError(data.error ?? "Failed to post"); setSavingAss(false); return; }
    setLocalAssignments(prev => [...prev, { ...data, submissions: [] }]);
    setNewAssTitle(""); setNewAssDesc(""); setSavingAss(false);
  }

  async function gradeSubmission(submissionId: string, assignmentId: string) {
    const res = await fetch("/api/tutor/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, grade: gradeValue }),
    });
    if (!res.ok) return;
    setLocalAssignments(prev => prev.map(a => a.id === assignmentId
      ? { ...a, submissions: a.submissions.map(s => s.id === submissionId ? { ...s, grade: gradeValue } : s) }
      : a
    ));
    setGradingId(null); setGradeValue("");
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] p-1 rounded-2xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ══ STUDENTS TAB ══ */}
      {tab === "students" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{cohort.enrollments.length} enrolled · {cohort.maxStudents} max capacity</p>
          </div>
          {cohort.enrollments.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No students enrolled yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                    {["Student", "Email", "Enrolled", "Paid", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 font-black text-xs uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohort.enrollments.map((e, i) => (
                    <tr key={e.id} className={`border-b border-white/[0.04] ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                            {(e.name ?? e.email)[0].toUpperCase()}
                          </div>
                          <span className="text-white font-bold">{e.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{e.email}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(e.createdAt).toLocaleDateString("en-GB")}</td>
                      <td className="px-4 py-3 text-white font-bold">{fmtNGN(e.amountPaid)} <span className="text-slate-500 text-xs font-normal">/ {fmtNGN(e.totalAmount)}</span></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLOR[e.paymentStatus] ?? STATUS_COLOR.UNPAID}`}>
                          {e.paymentStatus === "PAID" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {e.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ CURRICULUM TAB ══ */}
      {tab === "curriculum" && (
        <div className="space-y-3">
          {modules.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No curriculum modules added yet.</p>
            </div>
          ) : modules.map((mod, mi) => (
            <div key={mod.id} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
              >
                <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Module {mi + 1}</p>
                  <p className="text-white font-black mt-0.5">{mod.title}</p>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-xs">{mod.videos.length} lessons</span>
                  {openModule === mod.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {openModule === mod.id && (
                <div className="border-t border-white/[0.06]">
                  {mod.videos.map((v, vi) => (
                    <div key={v.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-slate-500 text-[10px] font-black shrink-0">{vi + 1}</span>
                        <span className="text-slate-300 text-sm">{v.title}</span>
                        {v.isFree && <span className="text-green-400 text-[10px] font-black bg-green-400/10 px-2 py-0.5 rounded-full">Free</span>}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs shrink-0">
                        <Clock className="w-3 h-3" /> {v.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ ASSIGNMENTS TAB ══ */}
      {tab === "assignments" && (
        <div className="space-y-5">
          {/* Create assignment */}
          <form onSubmit={postAssignment} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 space-y-3">
            <p className="text-white font-black">Post New Assignment</p>
            <input
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Assignment title..." value={newAssTitle} onChange={e => setNewAssTitle(e.target.value)} required
            />
            <textarea
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 h-20 resize-none"
              placeholder="Instructions and requirements..." value={newAssDesc} onChange={e => setNewAssDesc(e.target.value)} required
            />
            {assError && <p className="text-red-400 text-xs">{assError}</p>}
            <button type="submit" disabled={savingAss} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl disabled:opacity-60">
              {savingAss ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Assignment
            </button>
          </form>

          {/* Assignment list */}
          {localAssignments.map(a => (
            <div key={a.id} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <p className="text-white font-black">{a.title}</p>
                <p className="text-slate-400 text-sm mt-1">{a.description}</p>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">
                  Submissions ({a.submissions.length})
                </p>
                {a.submissions.length === 0 && <p className="text-slate-600 text-sm">No submissions yet.</p>}
                {a.submissions.map(sub => (
                  <div key={sub.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                      {(sub.user.name ?? sub.user.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{sub.user.name ?? sub.user.email}</p>
                      {sub.fileUrl && <a href={sub.fileUrl} className="text-indigo-400 text-xs hover:underline">View submission →</a>}
                    </div>
                    {sub.grade ? (
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-black px-2.5 py-1 rounded-full">{sub.grade}</span>
                    ) : gradingId === sub.id ? (
                      <div className="flex items-center gap-2">
                        <input value={gradeValue} onChange={e => setGradeValue(e.target.value)} placeholder="A, B+..." className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs" />
                        <button onClick={() => gradeSubmission(sub.id, a.id)} className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-xs">Save</button>
                        <button onClick={() => setGradingId(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setGradingId(sub.id); setGradeValue(""); }} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-400/30 px-2.5 py-1 rounded-full">Grade</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ ANNOUNCEMENTS TAB ══ */}
      {tab === "announce" && (
        <div className="space-y-5">
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 space-y-3">
            <p className="text-white font-black">Post Announcement</p>
            <textarea
              value={announce} onChange={e => setAnnounce(e.target.value)}
              placeholder="Write an announcement to all students in this cohort..."
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500 h-24 resize-none"
            />
            <button
              onClick={() => {
                if (!announce.trim()) return;
                setAnnouncements(prev => [{ text: announce.trim(), time: new Date().toLocaleString() }, ...prev]);
                setAnnounce("");
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl"
            >
              <Send className="w-4 h-4" /> Post to Cohort
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-[10px]">T</div>
                  <p className="text-white font-black text-sm">You (Tutor)</p>
                  <p className="text-slate-500 text-xs ml-auto">{a.time}</p>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
