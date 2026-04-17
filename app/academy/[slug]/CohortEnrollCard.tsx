"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Users, ChevronDown, Shield, Check,
  AlertCircle, Loader2, Clock, Zap, Lock, CreditCard, CheckCircle2
} from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  tutorName: string | null;
  startDate: string | null;
  endDate: string | null;
  maxStudents: number;
  price: number;
  partPaymentEnabled: boolean;
  partPaymentPercent: number;
  enrolledCount: number;
}

interface Props {
  course: { id: string; title: string; slug: string; price: string };
  cohorts: Cohort[];
  userId: string | null;
  userEmail: string | null;
  gradient?: string;
}

type PayType = "FULL" | "PART";
type Stage = "choose" | "confirm" | "processing" | "success";

function fmtNGN(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function SpotsBar({ enrolled, max }: { enrolled: number; max: number }) {
  const pct = Math.min(100, Math.round((enrolled / max) * 100));
  const color = pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-500">{max - enrolled} spots left</span>
        <span className="text-slate-400">{enrolled}/{max} enrolled</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CohortEnrollCard({
  course, cohorts, userId, userEmail, gradient = "from-indigo-600 to-purple-600"
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Cohort | null>(cohorts[0] ?? null);
  const [payType, setPayType] = useState<PayType>("FULL");
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("choose");
  const [error, setError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (cohorts.length === 0) {
    return (
      <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-br ${gradient} px-7 py-8`}>
          <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Enrolment</p>
          <p className="text-white font-black text-xl leading-tight">{course.title}</p>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🕐</div>
          <p className="font-black text-slate-900 text-lg mb-2">No open cohorts yet</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            New cohorts are announced regularly. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  const spotsLeft = selected ? selected.maxStudents - selected.enrolledCount : 0;
  const isFull = spotsLeft <= 0;
  const amountNGN = selected
    ? payType === "FULL"
      ? selected.price
      : (selected.price * selected.partPaymentPercent) / 100
    : 0;
  const balanceNGN = selected ? selected.price - amountNGN : 0;

  // ── Demo payment confirmation stage ──
  async function handleDemoEnroll() {
    if (!selected || !userId) return;
    setStage("processing");
    setError(null);
    try {
      // Simulate brief processing
      await new Promise(res => setTimeout(res, 1500));
      const res = await fetch("/api/academy/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohortId: selected.id,
          paymentType: payType,
          // no reference required – server auto-generates in demo mode
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enrollment failed");
      setStage("success");
      setTimeout(() => router.push("/student/profile"), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStage("confirm");
    }
  }

  // ── Success state ──
  if (stage === "success") {
    return (
      <div className="sticky top-28 rounded-3xl overflow-hidden shadow-xl">
        <div className={`bg-gradient-to-br ${gradient} p-10 text-center`}>
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <p className="font-black text-white text-2xl mb-2">You&apos;re enrolled! 🎉</p>
          <p className="text-white/70 text-sm">Taking you to your classroom...</p>
        </div>
      </div>
    );
  }

  // ── Confirm (demo payment) modal ──
  if (stage === "confirm" || stage === "processing") {
    return (
      <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className={`bg-gradient-to-br ${gradient} px-7 py-6`}>
          <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-0.5">Confirm Payment</p>
          <p className="text-white font-black text-lg">{course.title}</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Order summary */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Cohort</span><span className="font-bold text-slate-900 text-right max-w-[60%] truncate">{selected?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tutor</span><span className="font-bold text-slate-900">{selected?.tutorName ?? "TBD"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Starts</span><span className="font-bold text-slate-900">{fmtDate(selected?.startDate ?? null)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-bold text-slate-900">{payType === "FULL" ? "Full payment" : `${selected?.partPaymentPercent}% Part payment`}</span></div>
            <div className="border-t border-slate-200 pt-2.5 flex justify-between">
              <span className="text-slate-900 font-black">Amount Due</span>
              <span className="text-slate-900 font-black text-lg">{fmtNGN(amountNGN)}</span>
            </div>
            {payType === "PART" && (
              <div className="flex justify-between text-xs text-amber-600">
                <span>Balance later</span><span className="font-bold">{fmtNGN(balanceNGN)}</span>
              </div>
            )}
          </div>

          {/* Demo notice */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-xs text-indigo-700">
            <strong>Demo Mode:</strong> No real payment is processed. Click &ldquo;Confirm Enrollment&rdquo; to simulate a successful payment.
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button
            id="confirm-enroll-btn"
            onClick={handleDemoEnroll}
            disabled={stage === "processing"}
            className={`w-full py-4 bg-gradient-to-r ${gradient} hover:opacity-90 disabled:opacity-70 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg`}
          >
            {stage === "processing"
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              : <><CreditCard className="w-4 h-4" /> Confirm Enrollment</>
            }
          </button>
          <button
            onClick={() => setStage("choose")}
            disabled={stage === "processing"}
            className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Main: choose cohort & payment ──
  return (
    <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-br ${gradient} px-7 py-7`}>
        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Enroll in</p>
        <p className="text-white font-black text-xl leading-tight">{course.title}</p>
        {selected && (
          <div className="flex items-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-xs font-bold">{spotsLeft} seats available</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Cohort Selector */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Select Cohort</label>
          <div ref={dropRef} className="relative">
            <button
              id="cohort-selector"
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-left hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-bold text-slate-900 text-sm truncate">{selected?.name ?? "Choose a cohort"}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                {cohorts.map((c) => {
                  const spots = c.maxStudents - c.enrolledCount;
                  const full = spots <= 0;
                  return (
                    <button
                      key={c.id}
                      disabled={full}
                      onClick={() => { setSelected(c); setOpen(false); }}
                      className={`w-full text-left px-4 py-3.5 border-b border-slate-50 last:border-0 transition-colors ${full ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"} ${selected?.id === c.id ? "bg-indigo-50" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                        {selected?.id === c.id && <Check className="w-4 h-4 text-indigo-500" />}
                      </div>
                      <div className="flex gap-3 text-xs text-slate-400 mt-1">
                        <span>{fmtDate(c.startDate)} → {fmtDate(c.endDate)}</span>
                        <span className={full ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                          {full ? "Full" : `${spots} left`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cohort Details */}
        {selected && (
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-sm">
            {selected.tutorName && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Tutor</span>
                <span className="font-bold text-slate-900">{selected.tutorName}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Starts</span>
              <span className="font-bold text-slate-900">{fmtDate(selected.startDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Ends</span>
              <span className="font-bold text-slate-900">{fmtDate(selected.endDate)}</span>
            </div>
            <div className="pt-1"><SpotsBar enrolled={selected.enrolledCount} max={selected.maxStudents} /></div>
          </div>
        )}

        {/* Payment Option */}
        {selected && selected.partPaymentEnabled && (
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Payment Option</label>
            <div className="grid grid-cols-2 gap-2">
              {(["FULL", "PART"] as const).map(pt => {
                const amt = pt === "FULL" ? selected.price : (selected.price * selected.partPaymentPercent) / 100;
                const label = pt === "FULL" ? "Full Pay" : `${selected.partPaymentPercent}% Now`;
                const active = payType === pt;
                return (
                  <button
                    key={pt}
                    id={pt === "FULL" ? "pay-full-btn" : "pay-part-btn"}
                    onClick={() => setPayType(pt)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${active ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <p className={`font-black text-sm ${active ? "text-indigo-700" : "text-slate-700"}`}>{label}</p>
                    <p className={`text-xs mt-1 ${active ? "text-indigo-500" : "text-slate-400"}`}>{fmtNGN(amt)}</p>
                    {active && <span className="inline-block mt-1.5 text-[10px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded-full">Selected</span>}
                  </button>
                );
              })}
            </div>
            {payType === "PART" && (
              <div className="mt-2.5 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Balance of <strong>{fmtNGN(balanceNGN)}</strong> due before cohort starts.</span>
              </div>
            )}
          </div>
        )}

        {/* Price Summary */}
        {selected && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Pay today</span>
              <span className="text-3xl font-black text-slate-900">{fmtNGN(amountNGN)}</span>
            </div>
            {payType === "PART" && (
              <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                <span>Remaining balance</span>
                <span className="font-bold">{fmtNGN(balanceNGN)}</span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* CTA */}
        {!userId ? (
          <div className="space-y-3">
            <Link
              id="signin-to-enroll"
              href={`/student/login?redirect=/academy/${course.slug}`}
              className={`block w-full py-4 text-center bg-gradient-to-r ${gradient} text-white font-black rounded-2xl hover:opacity-90 shadow-lg text-sm transition-all`}
            >
              Sign In to Enroll
            </Link>
            <p className="text-center text-slate-400 text-xs">
              No account?{" "}
              <Link href={`/student/signup?redirect=/academy/${course.slug}`} className="text-indigo-600 font-bold hover:underline">
                Create one free →
              </Link>
            </p>
          </div>
        ) : isFull ? (
          <button disabled className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-2xl cursor-not-allowed text-sm">
            Cohort Full
          </button>
        ) : (
          <button
            id="pay-enroll-btn"
            onClick={() => { setError(null); setStage("confirm"); }}
            disabled={!selected}
            className={`w-full py-4 bg-gradient-to-r ${gradient} hover:opacity-90 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm`}
          >
            <CreditCard className="w-4 h-4" /> Enroll — {fmtNGN(amountNGN)}
          </button>
        )}

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-1">
          <Lock className="w-3 h-3" /><span>SSL encrypted</span>
          <span>·</span>
          <Shield className="w-3 h-3" /><span>Secure checkout</span>
        </div>
      </div>
    </div>
  );
}
