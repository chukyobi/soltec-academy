"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap, Plus, Users, CalendarDays, CheckCircle2,
  Clock, ChevronRight, Layers, BarChart2, Code2, Database,
  MonitorSmartphone, BookOpen, PenLine, Loader2, X, AlertCircle
} from "lucide-react";

const SLUG_ICONS: Record<string, React.ElementType> = {
  "product-design": Layers,
  "ui-ux-design": MonitorSmartphone,
  "data-analysis": BarChart2,
  "frontend-web-dev": Code2,
  "backend-web-dev": Database,
};

const COLORS = [
  { label: "Rose → Fuchsia", value: "from-rose-500 via-pink-500 to-fuchsia-600" },
  { label: "Violet → Indigo", value: "from-violet-600 via-purple-600 to-indigo-600" },
  { label: "Amber → Red", value: "from-amber-500 via-orange-500 to-red-500" },
  { label: "Cyan → Blue", value: "from-cyan-500 via-sky-500 to-blue-600" },
  { label: "Emerald → Green", value: "from-emerald-500 via-teal-500 to-green-600" },
  { label: "Indigo → Purple", value: "from-indigo-600 to-purple-600" },
];

interface Course {
  id: string; title: string; slug: string; level: string;
  duration: string; price: string; color: string;
  _count: { cohorts: number };
}

interface Cohort {
  id: string; name: string; tutorName: string | null;
  startDate: string | null; endDate: string | null;
  maxStudents: number; price: number; partPaymentEnabled: boolean;
  partPaymentPercent: number;
  course: { title: string; slug: string; color: string };
  _count: { enrollments: number };
}

interface Tutor { id: string; name: string | null; email: string; cohortCount: number; }

function fmtDate(iso: string | null) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtNGN(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function AdminAcademyPage() {
  const [tab, setTab] = useState<"courses" | "cohorts" | "tutors">("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [lastTutorPassword, setLastTutorPassword] = useState<string | null>(null);

  // Course form
  const [cf, setCf] = useState({ title: "", slug: "", description: "", level: "Beginner", duration: "3 Months", price: "NGN 100,000", color: COLORS[0].value, isProgramming: false, instructorName: "", instructorRole: "" });
  // Cohort form
  const [cohF, setCohF] = useState({ name: "", courseId: "", tutorUserId: "", startDate: "", endDate: "", maxStudents: "20", price: "100000", partPaymentEnabled: true, partPaymentPercent: "50" });
  // Tutor form
  const [tf, setTf] = useState({ name: "", email: "" });

  async function load() {
    setLoading(true);
    const [c, co, t] = await Promise.all([
      fetch("/api/admin/academy/courses").then(r => r.json()),
      fetch("/api/admin/academy/cohorts").then(r => r.json()),
      fetch("/api/admin/tutors").then(r => r.json()),
    ]);
    setCourses(Array.isArray(c) ? c : []);
    setCohorts(Array.isArray(co) ? co : []);
    setTutors(Array.isArray(t) ? t : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setModalError(null);
    const res = await fetch("/api/admin/academy/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cf, isProgramming: cf.isProgramming }) });
    const data = await res.json();
    if (!res.ok) { setModalError(data.error); setSaving(false); return; }
    setShowCourseModal(false); load();
    setCf({ title: "", slug: "", description: "", level: "Beginner", duration: "3 Months", price: "NGN 100,000", color: COLORS[0].value, isProgramming: false, instructorName: "", instructorRole: "" });
    setSaving(false);
  }

  async function saveCohort(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setModalError(null);
    const res = await fetch("/api/admin/academy/cohorts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cohF, maxStudents: Number(cohF.maxStudents), price: Number(cohF.price), partPaymentPercent: Number(cohF.partPaymentPercent), tutorUserId: cohF.tutorUserId || null }),
    });
    const data = await res.json();
    if (!res.ok) { setModalError(data.error); setSaving(false); return; }
    setShowCohortModal(false); load();
    setCohF({ name: "", courseId: "", tutorUserId: "", startDate: "", endDate: "", maxStudents: "20", price: "100000", partPaymentEnabled: true, partPaymentPercent: "50" });
    setSaving(false);
  }

  async function saveTutor(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setModalError(null); setLastTutorPassword(null);
    const res = await fetch("/api/admin/tutors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tf) });
    const data = await res.json();
    if (!res.ok) { setModalError(data.error); setSaving(false); return; }
    setLastTutorPassword(data.temporaryPassword);
    load();
    setTf({ name: "", email: "" });
    setSaving(false);
  }

  const inputCls = "w-full border border-slate-700 bg-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500";
  const labelCls = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Academy Management</h2>
          <p className="text-slate-400 text-sm mt-1">Manage course tracks, cohorts, and tutors</p>
        </div>
        <div className="flex gap-2">
          {tab === "courses" && <button onClick={() => { setShowCourseModal(true); setModalError(null); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all"><Plus className="w-4 h-4" /> New Track</button>}
          {tab === "cohorts" && <button onClick={() => { setShowCohortModal(true); setModalError(null); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all"><Plus className="w-4 h-4" /> New Cohort</button>}
          {tab === "tutors" && <button onClick={() => { setShowTutorModal(true); setModalError(null); setLastTutorPassword(null); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl transition-all"><Plus className="w-4 h-4" /> Create Tutor</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-2xl w-fit">
        {(["courses", "cohorts", "tutors"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${tab === t ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : (
        <>
          {/* ── COURSES TAB ── */}
          {tab === "courses" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(c => {
                const Icon = SLUG_ICONS[c.slug] ?? BookOpen;
                return (
                  <div key={c.id} className={`relative bg-gradient-to-br ${c.color} rounded-2xl p-6 text-white`}>
                    <div className="absolute top-4 right-4 bg-white/15 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">{c.level}</div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Icon className="w-5 h-5" /></div>
                    <h3 className="font-black text-lg leading-tight mb-1">{c.title}</h3>
                    <p className="text-white/60 text-xs mb-3">{c.duration} · {c.price}</p>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c._count.cohorts} cohorts</span>
                      <Link href={`/academy/${c.slug}`} className="flex items-center gap-1 hover:text-white transition-colors">View <ChevronRight className="w-3 h-3" /></Link>
                    </div>
                  </div>
                );
              })}
              {courses.length === 0 && <p className="text-slate-500 col-span-3 py-12 text-center">No tracks yet. Create one above.</p>}
            </div>
          )}

          {/* ── COHORTS TAB ── */}
          {tab === "cohorts" && (
            <div className="space-y-3">
              {cohorts.map(c => (
                <div key={c.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.course.color} flex items-center justify-center shrink-0`}>
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white">{c.name}</p>
                    <p className="text-slate-400 text-sm">{c.course.title}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {fmtDate(c.startDate)} → {fmtDate(c.endDate)}</span>
                      {c.tutorName && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.tutorName}</span>}
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {c._count.enrollments}/{c.maxStudents} enrolled</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-black text-lg">{fmtNGN(c.price)}</p>
                    <p className="text-slate-500 text-xs">{c.partPaymentEnabled ? `${c.partPaymentPercent}% part-pay` : "Full only"}</p>
                  </div>
                </div>
              ))}
              {cohorts.length === 0 && <p className="text-slate-500 py-12 text-center">No cohorts yet. Create one above.</p>}
            </div>
          )}

          {/* ── TUTORS TAB ── */}
          {tab === "tutors" && (
            <div className="space-y-3">
              {lastTutorPassword && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-300 font-black">Tutor account created!</p>
                    <p className="text-green-400 text-sm mt-1">Temporary password: <span className="font-black text-white bg-slate-800 px-2 py-0.5 rounded ml-1">{lastTutorPassword}</span></p>
                    <p className="text-green-600 text-xs mt-1">Share this with the tutor — it won&apos;t be shown again.</p>
                  </div>
                </div>
              )}
              {tutors.map(t => (
                <div key={t.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                    {(t.name ?? t.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white">{t.name ?? "—"}</p>
                    <p className="text-slate-400 text-sm">{t.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black">{t.cohortCount}</p>
                    <p className="text-slate-500 text-xs">cohorts</p>
                  </div>
                </div>
              ))}
              {tutors.length === 0 && <p className="text-slate-500 py-12 text-center">No tutors yet. Create one above.</p>}
            </div>
          )}
        </>
      )}

      {/* ── Course Modal ── */}
      {showCourseModal && (
        <Modal title="Create New Track" onClose={() => setShowCourseModal(false)}>
          <form onSubmit={saveCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={labelCls}>Title</label><input className={inputCls} value={cf.title} onChange={e => setCf(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))} required /></div>
              <div><label className={labelCls}>Slug</label><input className={inputCls} value={cf.slug} onChange={e => setCf(p => ({ ...p, slug: e.target.value }))} required /></div>
              <div><label className={labelCls}>Level</label><select className={inputCls} value={cf.level} onChange={e => setCf(p => ({ ...p, level: e.target.value }))}>{["Beginner", "Intermediate", "Advanced", "Beginner to Intermediate"].map(l => <option key={l}>{l}</option>)}</select></div>
              <div className="col-span-2"><label className={labelCls}>Description</label><textarea className={inputCls + " h-20 resize-none"} value={cf.description} onChange={e => setCf(p => ({ ...p, description: e.target.value }))} required /></div>
              <div><label className={labelCls}>Duration</label><input className={inputCls} value={cf.duration} onChange={e => setCf(p => ({ ...p, duration: e.target.value }))} /></div>
              <div><label className={labelCls}>Price (display)</label><input className={inputCls} value={cf.price} onChange={e => setCf(p => ({ ...p, price: e.target.value }))} /></div>
              <div><label className={labelCls}>Instructor Name</label><input className={inputCls} value={cf.instructorName} onChange={e => setCf(p => ({ ...p, instructorName: e.target.value }))} /></div>
              <div><label className={labelCls}>Instructor Role</label><input className={inputCls} value={cf.instructorRole} onChange={e => setCf(p => ({ ...p, instructorRole: e.target.value }))} /></div>
              <div className="col-span-2"><label className={labelCls}>Color Gradient</label>
                <div className="grid grid-cols-3 gap-2">{COLORS.map(c => <button type="button" key={c.value} onClick={() => setCf(p => ({ ...p, color: c.value }))} className={`h-10 rounded-xl bg-gradient-to-r ${c.value} border-2 transition-all ${cf.color === c.value ? "border-white scale-105" : "border-transparent"}`} title={c.label} />)}</div>
              </div>
            </div>
            {modalError && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{modalError}</p>}
            <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black rounded-xl flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Track
            </button>
          </form>
        </Modal>
      )}

      {/* ── Cohort Modal ── */}
      {showCohortModal && (
        <Modal title="Create New Cohort" onClose={() => setShowCohortModal(false)}>
          <form onSubmit={saveCohort} className="space-y-4">
            <div><label className={labelCls}>Cohort Name</label><input className={inputCls} value={cohF.name} onChange={e => setCohF(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Product Design – Cohort B" required /></div>
            <div><label className={labelCls}>Track / Course</label>
              <select className={inputCls} value={cohF.courseId} onChange={e => setCohF(p => ({ ...p, courseId: e.target.value }))} required>
                <option value="">Select a track...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Assign Tutor</label>
              <select className={inputCls} value={cohF.tutorUserId} onChange={e => setCohF(p => ({ ...p, tutorUserId: e.target.value }))}>
                <option value="">— No tutor yet —</option>
                {tutors.map(t => <option key={t.id} value={t.id}>{t.name ?? t.email}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Start Date</label><input type="date" className={inputCls} value={cohF.startDate} onChange={e => setCohF(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div><label className={labelCls}>End Date</label><input type="date" className={inputCls} value={cohF.endDate} onChange={e => setCohF(p => ({ ...p, endDate: e.target.value }))} /></div>
              <div><label className={labelCls}>Max Students</label><input type="number" className={inputCls} value={cohF.maxStudents} onChange={e => setCohF(p => ({ ...p, maxStudents: e.target.value }))} min="1" max="100" /></div>
              <div><label className={labelCls}>Price (₦)</label><input type="number" className={inputCls} value={cohF.price} onChange={e => setCohF(p => ({ ...p, price: e.target.value }))} /></div>
              <div><label className={labelCls}>Part-payment %</label><input type="number" className={inputCls} value={cohF.partPaymentPercent} onChange={e => setCohF(p => ({ ...p, partPaymentPercent: e.target.value }))} min="10" max="90" /></div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="partPay" checked={cohF.partPaymentEnabled} onChange={e => setCohF(p => ({ ...p, partPaymentEnabled: e.target.checked }))} className="w-4 h-4 accent-indigo-500" />
                <label htmlFor="partPay" className="text-slate-400 text-sm">Enable part-payment</label>
              </div>
            </div>
            {modalError && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{modalError}</p>}
            <button type="submit" disabled={saving} className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-black rounded-xl flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Cohort
            </button>
          </form>
        </Modal>
      )}

      {/* ── Tutor Modal ── */}
      {showTutorModal && (
        <Modal title="Create Tutor Account" onClose={() => setShowTutorModal(false)}>
          <form onSubmit={saveTutor} className="space-y-4">
            <p className="text-slate-400 text-sm">A password will be auto-generated and shown to you once. Share it with the tutor directly.</p>
            <div><label className={labelCls}>Full Name</label><input className={inputCls} value={tf.name} onChange={e => setTf(p => ({ ...p, name: e.target.value }))} placeholder="Tunde Bello" required /></div>
            <div><label className={labelCls}>Email Address</label><input type="email" className={inputCls} value={tf.email} onChange={e => setTf(p => ({ ...p, email: e.target.value }))} placeholder="tutor@soltec.ng" required /></div>
            {modalError && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{modalError}</p>}
            <button type="submit" disabled={saving} className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-black rounded-xl flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />} Create Account & Generate Password
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
