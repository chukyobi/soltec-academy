"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap, Plus, Users, CalendarDays, CheckCircle2,
  Layers, BarChart2, Code2, Database,
  MonitorSmartphone, BookOpen, PenLine, Loader2, X, AlertCircle, ChevronRight,
  ClipboardCheck, Search, Edit2, Trash2, ShieldAlert, ShieldCheck, Snowflake, Flame, Check
} from "lucide-react";
import { toast } from "sonner";

const SLUG_ICONS: Record<string, React.ElementType> = {
  "product-design": Layers,
  "ui-ux-design": MonitorSmartphone,
  "data-analysis": BarChart2,
  "frontend-web-dev": Code2,
  "backend-web-dev": Database,
};

const COLORS = [
  { label: "Slate / Indigo", value: "border-indigo-500/30 bg-indigo-500/5 text-indigo-400" },
  { label: "Slate / Teal", value: "border-teal-500/30 bg-teal-500/5 text-teal-400" },
  { label: "Slate / Slate", value: "border-white/10 bg-white/5 text-slate-400" },
];

const GRADIENTS = [
  { label: "Onyx", value: "bg-[#0d0d14]" },
  { label: "Deep Sea", value: "bg-[#09090f]" },
  { label: "Void", value: "bg-black" },
];

export interface CourseRow {
  id: string;
  title: string;
  slug: string;
  level: string;
  duration: string;
  price: string;
  color: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  isProgramming: boolean;
  instructorName: string | null;
  instructorAvatar?: string | null;
  instructorRole?: string | null;
  thumbnail: string | null;
  tag: string;
  gradient: string;
  outcomes: any;
  requirements: any;
  modules: any;
  _count: { cohorts: number };
}

export interface CohortRow {
  id: string; name: string; courseId: string;
  startDate: string | null; endDate: string | null;
  maxStudents: number; partPaymentEnabled: boolean;
  partPaymentPercent: number;
  isActive: boolean;
  course: { title: string; slug: string; color: string };
  tutors: { id: string; name: string | null }[];
  _count: { enrollments: number };
}

export interface TutorRow { id: string; name: string | null; email: string; isActive: boolean; cohortCount: number; }

function fmtDate(iso: string | null) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtNGN(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

interface Props {
  initialCourses: CourseRow[];
  initialCohorts: CohortRow[];
  initialTutors: TutorRow[];
}

export default function AcademyClient({ initialCourses, initialCohorts, initialTutors }: Props) {
  const [tab, setTab] = useState<"courses" | "cohorts" | "tutors">("courses");
  const [courses, setCourses] = useState<CourseRow[]>(initialCourses);
  const [cohorts, setCohorts] = useState<CohortRow[]>(initialCohorts);
  const [tutors, setTutors] = useState<TutorRow[]>(initialTutors);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [lastTutorPassword, setLastTutorPassword] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: "courses" | "cohorts" | "tutors"; id: string } | null>(null);

  const [cf, setCf] = useState({
    title: "", slug: "", description: "", level: "Beginner",
    duration: "3 Months", price: "NGN 100,000", basePrice: "100000",
    color: COLORS[0].value, gradient: "from-indigo-600 via-purple-600 to-pink-600",
    tag: "Engineering", isProgramming: false,
    instructorName: "",
    outcomes: [] as string[],
    requirements: [] as string[],
    modules: [] as any[],
  });
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  // Cohort form
  const [cohF, setCohF] = useState({
    name: "", courseId: "",
    startDate: "", endDate: "", maxStudents: "20",
    partPaymentEnabled: true, partPaymentPercent: "50",
    tutorIds: [] as string[],
  });
  // Tutor form
  const [tf, setTf] = useState({ name: "", email: "" });

  async function reload() {
    setLoading(true);
    try {
      const [c, co, t] = await Promise.all([
        fetch("/api/admin/academy/courses").then(r => r.ok ? r.json() : []),
        fetch("/api/admin/academy/cohorts").then(r => r.ok ? r.json() : []),
        fetch("/api/admin/tutors").then(r => r.ok ? r.json() : []),
      ]);
      setCourses(Array.isArray(c) ? c : []);
      setCohorts(Array.isArray(co) ? co : []);
      setTutors(Array.isArray(t) ? t : []);
    } catch (err) {
      console.error("Failed to reload academy data:", err);
      toast.error("Failed to refresh data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setModalError(null);
    const method = editingId ? "PATCH" : "POST";
    const endpoint = editingId ? `/api/admin/academy/courses/${editingId}` : "/api/admin/academy/courses";
    
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...cf,
        basePrice: Number(cf.basePrice),
        instructorRole: "Tutor",
        outcomes: cf.outcomes,
        requirements: cf.requirements,
        modules: cf.modules,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setModalError(data.error); setSaving(false); return; }
    setShowCourseModal(false);
    setEditingId(null);
    reload();
    setCf({ 
      title: "", slug: "", description: "", level: "Beginner", 
      duration: "3 Months", price: "NGN 100,000", basePrice: "100000", 
      color: COLORS[0].value, gradient: "from-indigo-600 via-purple-600 to-pink-600",
      tag: "Engineering", isProgramming: false, instructorName: "",
      outcomes: [], requirements: [], modules: []
    });
    setSelectedInstructors([]);
    setSaving(false);
  }

  async function saveCohort(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setModalError(null);
    const method = editingId ? "PATCH" : "POST";
    const endpoint = editingId ? `/api/admin/academy/cohorts/${editingId}` : "/api/admin/academy/cohorts";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...cohF,
        maxStudents: Number(cohF.maxStudents),
        partPaymentPercent: Number(cohF.partPaymentPercent),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setModalError(data.error); setSaving(false); return; }
    setShowCohortModal(false);
    setEditingId(null);
    reload();
    setCohF({ name: "", courseId: "", startDate: "", endDate: "", maxStudents: "20", partPaymentEnabled: true, partPaymentPercent: "50", tutorIds: [] });
    setSaving(false);
  }

  async function saveTutor(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setModalError(null); setLastTutorPassword(null);
    const res = await fetch("/api/admin/tutors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tf),
    });
    const data = await res.json();
    if (!res.ok) { setModalError(data.error); setSaving(false); return; }
    setLastTutorPassword(data.temporaryPassword);
    reload();
    setTf({ name: "", email: "" });
    setSaving(false);
  }

  async function toggleFreeze(type: "courses" | "cohorts" | "tutors", id: string, currentStatus: boolean) {
    const endpoint = type === "courses" ? `/api/admin/academy/courses/${id}` : type === "cohorts" ? `/api/admin/academy/cohorts/${id}` : `/api/admin/tutors/${id}`;
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    if (res.ok) {
      toast.success(`${type.slice(0, -1)} ${!currentStatus ? "activated" : "frozen"} successfully`);
      reload();
    } else {
      toast.error("Failed to update status");
    }
  }

  async function deleteItem(type: "courses" | "cohorts" | "tutors", id: string) {
    setDeleting(true);
    const endpoint = type === "courses" ? `/api/admin/academy/courses/${id}` : type === "cohorts" ? `/api/admin/academy/cohorts/${id}` : `/api/admin/tutors/${id}`;
    const res = await fetch(endpoint, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success(`${type.slice(0, -1)} deleted successfully`);
      reload();
      setConfirmModal(null);
    } else {
      toast.error(data.error || "Failed to delete item");
    }
    setDeleting(false);
  }

  const inputCls = "w-full border border-slate-700 bg-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500";
  const labelCls = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Academy Management</h2>
          <p className="text-slate-500 text-sm font-black uppercase tracking-widest mt-1">Operational Control Center</p>
        </div>
        <div className="flex gap-3">
          {tab === "courses" && (
            <button
              onClick={() => { 
                setEditingId(null);
                setCf({ 
                  title: "", slug: "", description: "", level: "Beginner", 
                  duration: "3 Months", price: "NGN 100,000", basePrice: "100000", 
                  color: COLORS[0].value, gradient: "from-indigo-600 via-purple-600 to-pink-600",
                  tag: "Engineering", isProgramming: false, instructorName: "",
                  outcomes: [], requirements: [], modules: []
                });
                setShowCourseModal(true); 
                setModalError(null); 
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> New Track
            </button>
          )}
          {tab === "cohorts" && (
            <button
              onClick={() => { 
                setEditingId(null);
                setCohF({ name: "", courseId: "", startDate: "", endDate: "", maxStudents: "20", partPaymentEnabled: true, partPaymentPercent: "50", tutorIds: [] });
                setShowCohortModal(true); 
                setModalError(null); 
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> New Cohort
            </button>
          )}
          {tab === "tutors" && (
            <button
              onClick={() => { setShowTutorModal(true); setModalError(null); setLastTutorPassword(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Create Tutor
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#0d0d14] p-2 rounded-2xl w-fit border border-white/5">
        {(["courses", "cohorts", "tutors"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            {t === "courses" ? `Tracks (${courses.length})` : t === "cohorts" ? `Cohorts (${cohorts.length})` : `Tutors (${tutors.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Refreshing...
        </div>
      ) : (
        <>
          {/* ── COURSES TAB ── */}
          {tab === "courses" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(c => {
                const Icon = SLUG_ICONS[c.slug] ?? BookOpen;
                return (
                  <div key={c.id} className={`group relative bg-[#09090f] border border-white/5 rounded-[32px] p-8 transition-all duration-500 ${!c.isActive ? "opacity-40 grayscale" : "hover:border-indigo-500/30 hover:bg-[#0d0d14] shadow-2xl"}`}>
                    <div className="absolute top-6 left-6 flex gap-2">
                       <span className="bg-white/[0.03] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5">{c.level}</span>
                    </div>
                    
                    <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mb-8 mt-10 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all shadow-inner">
                      <Icon className="w-8 h-8 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>

                    <h3 className="font-black text-white text-2xl leading-tight mb-3 tracking-tight group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-8 opacity-60">{c.duration} · {c.price}</p>
                    
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 pt-6 border-t border-white/5">
                      <span className="flex items-center gap-3"><Users className="w-5 h-5 text-slate-800" /> {c._count?.cohorts || 0} Cohorts</span>
                      <Link href={`/academy/${c.slug}`} className="flex items-center gap-2 hover:text-white transition-colors group/link">
                        Manage <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Action Overlay */}
                    <div className="absolute top-4 right-4 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingId(c.id);
                          setCf({
                            title: c.title,
                            slug: c.slug,
                            description: c.description || "",
                            level: c.level,
                            duration: c.duration,
                            price: c.price,
                            basePrice: String(c.basePrice),
                            color: c.color,
                            instructorName: c.instructorName || "",
                            isProgramming: c.isProgramming || false,
                            outcomes: Array.isArray(c.outcomes) ? (c.outcomes as string[]) : [],
                            requirements: Array.isArray(c.requirements) ? (c.requirements as string[]) : [],
                            modules: Array.isArray(c.modules) ? (c.modules as any[]) : [],
                            tag: c.tag || "",
                            gradient: c.gradient || "",
                          });
                          setShowCourseModal(true);
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                        title="Edit Track"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleFreeze("courses", c.id, c.isActive)}
                        className={`p-2 rounded-lg backdrop-blur-md transition-colors ${c.isActive ? "bg-white/10 hover:bg-white/20 text-white" : "bg-orange-500/50 hover:bg-orange-500 text-white"}`}
                        title={c.isActive ? "Freeze Track" : "Activate Track"}
                      >
                        {c.isActive ? <Snowflake className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, type: "courses", id: c.id })}
                        className="p-2 rounded-lg bg-white/10 hover:bg-red-500 text-white backdrop-blur-md transition-colors"
                        title="Delete Track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
              {courses.length === 0 && (
                <p className="text-slate-500 col-span-3 py-12 text-center">No tracks yet. Create one above.</p>
              )}
            </div>
          )}

          {/* ── COHORTS TAB ── */}
          {tab === "cohorts" && (
            <div className="space-y-4">
              {cohorts.map(c => (
                <div key={c.id} className={`group relative bg-[#0d0d14] border border-white/5 rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center gap-6 transition-all ${!c.isActive ? "opacity-40 grayscale" : "hover:border-white/20 hover:bg-[#12121a] shadow-xl"}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all`}>
                    <GraduationCap className="w-7 h-7 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-white font-black text-lg tracking-tight truncate">{c.name}</h3>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">{c.course.title}</span>
                      {!c.isActive && (
                        <span className="flex items-center gap-1 bg-white/10 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10">
                          <Snowflake className="w-2.5 h-2.5" /> Frozen
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs font-bold flex items-center flex-wrap gap-4">
                      <span className="flex items-center gap-2 uppercase tracking-tighter"><CalendarDays className="w-4 h-4 text-slate-600" /> {fmtDate(c.startDate)} – {fmtDate(c.endDate)}</span>
                      <span className="flex items-center gap-2 uppercase tracking-tighter"><Users className="w-4 h-4 text-slate-600" /> {c._count.enrollments} / {c.maxStudents} Students</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingId(c.id);
                        setCohF({
                          name: c.name,
                          courseId: c.courseId,
                          startDate: c.startDate ? c.startDate.split('T')[0] : "",
                          endDate: c.endDate ? c.endDate.split('T')[0] : "",
                          maxStudents: String(c.maxStudents),
                          partPaymentEnabled: c.partPaymentEnabled,
                          partPaymentPercent: String(c.partPaymentPercent),
                          tutorIds: (c.tutors || []).map(t => t.id)
                        });
                        setShowCohortModal(true);
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      title="Edit Cohort"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleFreeze("cohorts", c.id, c.isActive)}
                      className={`p-2.5 rounded-xl transition-all ${c.isActive ? "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white" : "bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white"}`}
                      title={c.isActive ? "Freeze Cohort" : "Activate Cohort"}
                    >
                      {c.isActive ? <Snowflake className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, type: "cohorts", id: c.id })}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                      title="Delete Cohort"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {cohorts.length === 0 && <p className="text-slate-500 py-12 text-center">No cohorts yet. Create one above.</p>}
            </div>
          )}

          {tab === "tutors" && (
            <div className="space-y-4">
              {lastTutorPassword && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-6 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-300 font-black uppercase tracking-widest text-sm">Tutor account created!</p>
                    <p className="text-emerald-400/70 text-xs mt-1">
                      Share this temporary password with the tutor: 
                      <span className="font-black text-white bg-slate-800 px-3 py-1 rounded-lg ml-2 border border-white/10 select-all">{lastTutorPassword}</span>
                    </p>
                  </div>
                </div>
              )}
              {tutors.map(t => (
                <div key={t.id} className={`group bg-[#0d0d14] border border-white/5 rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center gap-6 transition-all ${!t.isActive ? "opacity-40 grayscale" : "hover:border-white/20 hover:bg-[#12121a] shadow-xl"}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all`}>
                    <Users className={`w-7 h-7 ${!t.isActive ? "text-slate-600" : "text-slate-400 group-hover:text-indigo-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-black text-white text-lg tracking-tight truncate">{t.name || "Unnamed Tutor"}</p>
                      {!t.isActive && (
                        <span className="flex items-center gap-1 bg-white/10 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10">
                          <Snowflake className="w-2.5 h-2.5" /> Frozen
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs font-bold truncate uppercase tracking-tighter">{t.email}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-white text-lg font-black">{t.cohortCount}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Cohorts</p>
                    </div>
                    <button 
                      onClick={() => toggleFreeze("tutors", t.id, t.isActive)}
                      className={`p-2.5 rounded-xl transition-all ${t.isActive ? "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white" : "bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white"}`}
                      title={t.isActive ? "Freeze Tutor" : "Activate Tutor"}
                    >
                      {t.isActive ? <Snowflake className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, type: "tutors", id: t.id })}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                      title="Delete Tutor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        <Modal title={editingId ? "Edit Track" : "Create New Track"} onClose={() => setShowCourseModal(false)}>
          <form onSubmit={saveCourse} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Title</label>
                <input className={inputCls} value={cf.title}
                  onChange={e => setCf(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))}
                  required />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input className={inputCls} value={cf.slug}
                  onChange={e => setCf(p => ({ ...p, slug: e.target.value }))} required />
              </div>
              <div>
                <label className={labelCls}>Level</label>
                <select className={inputCls} value={cf.level} onChange={e => setCf(p => ({ ...p, level: e.target.value }))}>
                  {["Beginner", "Intermediate", "Advanced", "Beginner to Intermediate"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description</label>
                <textarea className={inputCls + " h-20 resize-none"} value={cf.description}
                  onChange={e => setCf(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div>
                <label className={labelCls}>Duration</label>
                <input className={inputCls} value={cf.duration} onChange={e => setCf(p => ({ ...p, duration: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Category Tag</label>
                <input className={inputCls} value={cf.tag} onChange={e => setCf(p => ({ ...p, tag: e.target.value }))} placeholder="e.g. Design" />
              </div>
              <div>
                <label className={labelCls}>Price (display)</label>
                <input className={inputCls} value={cf.price} onChange={e => setCf(p => ({ ...p, price: e.target.value }))} placeholder="e.g. NGN 100,000" />
              </div>
              <div>
                <label className={labelCls}>Price (Numeric ₦)</label>
                <input type="number" className={inputCls} value={cf.basePrice} onChange={e => setCf(p => ({ ...p, basePrice: e.target.value }))} placeholder="100000" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Gradient Theme (Page Background)</label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENTS.map(g => (
                    <button type="button" key={g.value}
                      onClick={() => setCf(p => ({ ...p, gradient: g.value }))}
                      className={`h-12 rounded-xl bg-gradient-to-br ${g.value} border-2 flex flex-col items-center justify-center transition-all ${cf.gradient === g.value ? "border-white scale-105 shadow-lg" : "border-white/5 opacity-60 hover:opacity-100"}`}
                    >
                      <span className="text-[8px] font-black uppercase tracking-tighter text-white/80">{g.label}</span>
                    </button>
                  ))}
                </div>
                <input className={inputCls + " mt-3 text-[10px] py-1.5 opacity-50"} value={cf.gradient} onChange={e => setCf(p => ({ ...p, gradient: e.target.value }))} placeholder="Or paste custom Tailwind classes..." />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Card Accent Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {COLORS.map(c => (
                    <button type="button" key={c.value}
                      onClick={() => setCf(p => ({ ...p, color: c.value }))}
                      className={`h-10 rounded-xl bg-gradient-to-r ${c.value} border-2 transition-all ${cf.color === c.value ? "border-white scale-105" : "border-white/5 opacity-60 hover:opacity-100"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-700">
              <div>
                <label className={labelCls}>Learning Outcomes</label>
                <div className="space-y-2">
                  {cf.outcomes.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={inputCls} value={o} onChange={e => {
                        const next = [...cf.outcomes];
                        next[i] = e.target.value;
                        setCf(p => ({ ...p, outcomes: next }));
                      }} />
                      <button type="button" onClick={() => setCf(p => ({ ...p, outcomes: p.outcomes.filter((_, idx) => idx !== i) }))} className="p-2 text-red-400">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setCf(p => ({ ...p, outcomes: [...p.outcomes, ""] }))} className="text-indigo-400 text-xs font-bold">+ Add Outcome</button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Curriculum Modules</label>
                <div className="space-y-4">
                  {cf.modules.map((m, mi) => (
                    <div key={mi} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <input className="bg-transparent border-none text-white font-bold p-0 text-sm w-full" value={m.title} onChange={e => {
                          const next = [...cf.modules];
                          next[mi].title = e.target.value;
                          setCf(p => ({ ...p, modules: next }));
                        }} placeholder="Module Title" />
                        <button type="button" onClick={() => setCf(p => ({ ...p, modules: p.modules.filter((_, idx) => idx !== mi) }))} className="text-red-400 text-[10px] font-black uppercase">Remove</button>
                      </div>
                      <div className="space-y-2 pl-4 border-l-2 border-indigo-500/30">
                        {m.lessons?.map((l: any, li: number) => (
                          <div key={li} className="flex gap-2">
                            <input className={`${inputCls} py-1.5`} placeholder="Lesson Title" value={l.title} onChange={e => {
                              const next = [...cf.modules];
                              next[mi].lessons[li].title = e.target.value;
                              setCf(p => ({ ...p, modules: next }));
                            }} />
                            <input className={`${inputCls} py-1.5 w-24`} placeholder="20m" value={l.duration} onChange={e => {
                              const next = [...cf.modules];
                              next[mi].lessons[li].duration = e.target.value;
                              setCf(p => ({ ...p, modules: next }));
                            }} />
                            <button type="button" onClick={() => {
                              const next = [...cf.modules];
                              next[mi].lessons = next[mi].lessons.filter((_: any, idx: number) => idx !== li);
                              setCf(p => ({ ...p, modules: next }));
                            }} className="p-1.5 text-slate-500">×</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const next = [...cf.modules];
                          if (!next[mi].lessons) next[mi].lessons = [];
                          next[mi].lessons.push({ title: "", duration: "" });
                          setCf(p => ({ ...p, modules: next }));
                        }} className="text-slate-500 text-[10px] font-bold hover:text-indigo-400">+ Add Lesson</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setCf(p => ({ ...p, modules: [...p.modules, { title: "", lessons: [] }] }))} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 font-bold hover:border-slate-500 transition-all text-xs">+ Add Module</button>
                </div>
              </div>
            </div>

            {modalError && <p className="text-red-400 text-sm flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4" />{modalError}</p>}
            
            <div className="sticky bottom-0 pt-4 bg-slate-900 pb-2">
              <button type="submit" disabled={saving}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-900/20">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                {editingId ? "Save Changes" : "Create Track"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Cohort Modal ── */}
      {showCohortModal && (
        <Modal title={editingId ? "Edit Cohort" : "Create New Cohort"} onClose={() => setShowCohortModal(false)}>
          <form onSubmit={saveCohort} className="space-y-4">
            <div>
              <label className={labelCls}>Cohort Name</label>
              <input className={inputCls} value={cohF.name}
                onChange={e => setCohF(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Product Design – Cohort B" required />
            </div>
            <div>
              <label className={labelCls}>Track / Course</label>
              <select className={inputCls} value={cohF.courseId}
                onChange={e => setCohF(p => ({ ...p, courseId: e.target.value }))} required>
                <option value="">Select a track...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Assign Tutors</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {cohF.tutorIds.length === 0 && <p className="text-slate-600 text-[10px] uppercase font-bold italic">No tutors selected</p>}
                {cohF.tutorIds.map(id => {
                  const tutor = tutors.find(t => t.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {tutor?.name || "Tutor"}
                      <button type="button" onClick={() => setCohF(p => ({ ...p, tutorIds: p.tutorIds.filter(tid => tid !== id) }))}>
                        <X className="w-3 h-3 hover:text-white transition-colors" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <select 
                  className={`${inputCls} pl-10`}
                  onChange={e => {
                    if (e.target.value && !cohF.tutorIds.includes(e.target.value)) {
                      setCohF(p => ({ ...p, tutorIds: [...p.tutorIds, e.target.value] }));
                    }
                  }}
                  value=""
                >
                  <option value="">Select Tutors to Assign...</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id} disabled={cohF.tutorIds.includes(t.id)}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Start Date</label>
                <input type="date" className={inputCls} value={cohF.startDate}
                  onChange={e => setCohF(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input type="date" className={inputCls} value={cohF.endDate}
                  onChange={e => setCohF(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Max Students</label>
                <input type="number" className={inputCls} value={cohF.maxStudents}
                  onChange={e => setCohF(p => ({ ...p, maxStudents: e.target.value }))} min="1" max="100" />
              </div>
              <div>
                <label className={labelCls}>Part-payment %</label>
                <input type="number" className={inputCls} value={cohF.partPaymentPercent}
                  onChange={e => setCohF(p => ({ ...p, partPaymentPercent: e.target.value }))} min="10" max="90" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="partPay" checked={cohF.partPaymentEnabled}
                  onChange={e => setCohF(p => ({ ...p, partPaymentEnabled: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500" />
                <label htmlFor="partPay" className="text-slate-400 text-sm">Enable part-payment</label>
              </div>
            </div>
            {modalError && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{modalError}</p>}
            <button type="submit" disabled={saving}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-black rounded-xl flex items-center justify-center gap-2">
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
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} value={tf.name}
                onChange={e => setTf(p => ({ ...p, name: e.target.value }))}
                placeholder="Tunde Bello" required />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" className={inputCls} value={tf.email}
                onChange={e => setTf(p => ({ ...p, email: e.target.value }))}
                placeholder="tutor@soltec.ng" required />
            </div>
            {modalError && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{modalError}</p>}
            <button type="submit" disabled={saving}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-black rounded-xl flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />} Create Account & Generate Password
            </button>
          </form>

          {lastTutorPassword && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 mt-4 animate-in zoom-in duration-300">
              <p className="text-green-400 text-xs font-black uppercase tracking-widest mb-2">Temporary Password</p>
              <div className="flex items-center justify-between gap-4">
                <code className="text-xl font-black text-white tracking-widest">{lastTutorPassword}</code>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lastTutorPassword);
                    toast.success("Password copied to clipboard!");
                  }}
                  className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                >
                  Copy
                </button>
              </div>
              <p className="text-slate-500 text-[10px] mt-3 font-medium uppercase tracking-tight">Copy this now. It will not be shown again.</p>
            </div>
          )}
        </Modal>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmModal?.isOpen && (
        <ConfirmModal 
          title={`Delete ${confirmModal.type.slice(0, -1)}`}
          message={`Are you sure you want to delete this ${confirmModal.type.slice(0, -1)}? This action cannot be undone.`}
          onConfirm={() => deleteItem(confirmModal.type, confirmModal.id)}
          onClose={() => setConfirmModal(null)}
          isDeleting={deleting}
        />
      )}
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onClose, isDeleting }: { title: string; message: string; onConfirm: () => void; onClose: () => void; isDeleting: boolean }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={!isDeleting ? onClose : undefined} />
      <div className="relative z-10 bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-white font-black text-xl text-center mb-2">{title}</h3>
        <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
          {message}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
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
