"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Clock, CheckCircle2, Lock, Play,
  ClipboardList, MessageSquare, Award, ChevronDown, ChevronUp,
  FileUp, Loader2, Send, GraduationCap, Users, AlertCircle
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  videos: { id: string; title: string; duration: string; isFree: boolean }[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  mySubmission: { id: string; fileUrl: string | null; grade: string | null } | null;
}

interface Props {
  cohort: {
    id: string; name: string; startDate: string | null; endDate: string | null;
    tutorName: string | null; totalStudents: number;
    course: { title: string; slug: string; color: string; level: string; duration: string };
    assignments: Assignment[];
    enrollment: { paymentStatus: string; amountPaid: number; totalAmount: number };
  };
  modules: Module[];
  totalLessons: number;
  studentName: string;
}

function fmtDate(iso: string | null) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtNGN(n: number) { return `₦${n.toLocaleString("en-NG")}`; }

export default function StudentClassroomClient({ cohort, modules, totalLessons, studentName }: Props) {
  const [tab, setTab] = useState<"lessons" | "assignments" | "announcements" | "progress">("lessons");
  const [openModule, setOpenModule] = useState<string | null>(modules[0]?.id ?? null);
  const [currentLesson, setCurrentLesson] = useState<{ moduleTitle: string; lesson: Module["videos"][0] } | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>(cohort.assignments);

  const completedLessons = Math.floor(totalLessons * 0.2); // demo progress
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const balance = cohort.enrollment.totalAmount - cohort.enrollment.amountPaid;

  const tabs = [
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "announcements", label: "Announcements", icon: MessageSquare },
    { id: "progress", label: "My Progress", icon: Award },
  ] as const;

  async function submitAssignment(assignmentId: string) {
    if (!submitUrl.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/student/submit-assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, fileUrl: submitUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      setLocalAssignments(prev => prev.map(a =>
        a.id === assignmentId ? { ...a, mySubmission: { id: data.id, fileUrl: submitUrl, grade: null } } : a
      ));
      setSubmittingId(null); setSubmitUrl("");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#09090f]/90 backdrop-blur border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/student/profile" className="text-slate-400 hover:text-white transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-white font-black text-sm leading-tight truncate">{cohort.name}</p>
              <p className="text-slate-500 text-xs">{cohort.course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {cohort.tutorName && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <GraduationCap className="w-3.5 h-3.5" /> {cohort.tutorName}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5" /> {cohort.totalStudents} students
            </div>
          </div>
        </div>
      </header>

      {/* Balance warning */}
      {balance > 0 && (
        <div className="bg-amber-900/20 border-b border-amber-500/20 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm font-medium">
              Outstanding balance: <strong>{fmtNGN(balance)}</strong> due before cohort starts.{" "}
              <Link href={`/academy/${cohort.course.slug}`} className="underline font-bold">Pay now →</Link>
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] p-1 rounded-2xl w-fit mb-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${tab === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ══ LESSONS ══ */}
        {tab === "lessons" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              {currentLesson ? (
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl overflow-hidden">
                  <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${cohort.course.color} opacity-20`} />
                    <div className="relative text-center">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white font-black">{currentLesson.lesson.title}</p>
                      <p className="text-white/60 text-sm mt-1">{currentLesson.moduleTitle}</p>
                      <p className="text-white/40 text-xs mt-1">{currentLesson.lesson.duration}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-white font-black text-lg">{currentLesson.lesson.title}</p>
                    <p className="text-slate-400 text-sm mt-1">{currentLesson.moduleTitle}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {currentLesson.lesson.duration}</span>
                      {currentLesson.lesson.isFree && <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full">Free Preview</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${cohort.course.color} flex items-center justify-center mx-auto mb-4`}>
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white font-black text-lg">Select a lesson to start</p>
                    <p className="text-slate-400 text-sm mt-1">Choose from the curriculum on the right</p>
                  </div>
                </div>
              )}
            </div>

            {/* Curriculum Sidebar */}
            <div className="space-y-3 lg:max-h-[600px] lg:overflow-y-auto pr-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-black">{modules.length} Modules</p>
                <p className="text-slate-400 text-xs">{totalLessons} lessons</p>
              </div>
              {modules.map((mod, mi) => (
                <div key={mod.id} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03]"
                  >
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Module {mi + 1}</p>
                      <p className="text-white font-bold text-sm">{mod.title}</p>
                    </div>
                    {openModule === mod.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openModule === mod.id && (
                    <div className="border-t border-white/[0.06]">
                      {mod.videos.map((v, vi) => (
                        <button
                          key={v.id}
                          onClick={() => setCurrentLesson({ moduleTitle: mod.title, lesson: v })}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.05] border-b border-white/[0.04] last:border-0 transition-colors ${currentLesson?.lesson.id === v.id ? "bg-white/[0.08]" : ""}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${currentLesson?.lesson.id === v.id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500"}`}>
                            {vi + 1}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-slate-300 text-xs truncate">{v.title}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {v.isFree && <span className="text-green-400 text-[9px] font-black">FREE</span>}
                            <span className="text-slate-500 text-[10px]">{v.duration}</span>
                            <Play className="w-3 h-3 text-slate-500" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ASSIGNMENTS ══ */}
        {tab === "assignments" && (
          <div className="space-y-4 max-w-2xl">
            {localAssignments.length === 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center">
                <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">No assignments posted yet.</p>
              </div>
            )}
            {localAssignments.map(a => (
              <div key={a.id} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-white font-black text-lg">{a.title}</p>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{a.description}</p>
                </div>
                {a.mySubmission ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-bold text-sm">Submitted!</p>
                      {a.mySubmission.fileUrl && <a href={a.mySubmission.fileUrl} className="text-green-400 text-xs underline">View your submission →</a>}
                      {a.mySubmission.grade && (
                        <div className="mt-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300 font-black text-sm">Grade: {a.mySubmission.grade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : submittingId === a.id ? (
                  <div className="space-y-3">
                    <input
                      placeholder="Paste your submission URL (Google Drive, GitHub, etc.)"
                      value={submitUrl} onChange={e => setSubmitUrl(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => submitAssignment(a.id)} disabled={submitting || !submitUrl.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl disabled:opacity-60">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit
                      </button>
                      <button onClick={() => setSubmittingId(null)} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSubmittingId(a.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl transition-all">
                    <FileUp className="w-4 h-4" /> Submit Assignment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ ANNOUNCEMENTS ══ */}
        {tab === "announcements" && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  {cohort.tutorName?.[0] ?? "T"}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{cohort.tutorName ?? "Your Tutor"}</p>
                  <p className="text-slate-500 text-xs">Just now</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Welcome to <strong className="text-white">{cohort.name}</strong>! 🎉 We&apos;re excited to have you here.
                First live session begins on <strong className="text-white">{fmtDate(cohort.startDate)}</strong>. Make sure your
                setup is ready. Check the lessons tab to preview the curriculum.
              </p>
            </div>
          </div>
        )}

        {/* ══ PROGRESS ══ */}
        {tab === "progress" && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6">
              <p className="text-white font-black text-xl mb-5">My Progress</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Course completion</span>
                    <span className="text-white font-black">{progressPct}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${cohort.course.color} rounded-full transition-all`} style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{completedLessons} / {totalLessons} lessons watched</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { label: "Assignments Done", value: localAssignments.filter(a => a.mySubmission).length, total: localAssignments.length },
                    { label: "Lessons Watched", value: completedLessons, total: totalLessons },
                  ].map(({ label, value, total }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
                      <p className="text-white font-black text-2xl">{value}<span className="text-slate-500 text-base font-normal">/{total}</span></p>
                      <p className="text-slate-500 text-xs mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6">
              <p className="text-white font-black mb-4">Payment Status</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total fee</span>
                  <span className="text-white font-bold">{fmtNGN(cohort.enrollment.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Paid</span>
                  <span className="text-green-400 font-bold">{fmtNGN(cohort.enrollment.amountPaid)}</span>
                </div>
                {balance > 0 && (
                  <div className="flex justify-between text-sm border-t border-white/5 pt-2 mt-1">
                    <span className="text-amber-400 font-bold">Balance</span>
                    <span className="text-amber-400 font-black">{fmtNGN(balance)}</span>
                  </div>
                )}
              </div>
              {cohort.enrollment.paymentStatus === "PAID" && (
                <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Fully paid — you&apos;re all set!
                </div>
              )}
            </div>

            {progressPct === 100 && (
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-3xl p-6 text-center">
                <Award className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-white font-black text-xl">Course Complete! 🎉</p>
                <p className="text-slate-400 text-sm mt-1">Your certificate is ready to download.</p>
                <button className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-xl text-sm transition-all">
                  Download Certificate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
