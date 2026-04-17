'use client';

import { ArrowRight } from 'lucide-react';
import { FiZap } from 'react-icons/fi';

// ── Cartoon SVG illustrations (inline, no external deps) ─────────────────────

function CartoonPalette() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="64" height="64" rx="16" fill="#fff0f6" />
      <circle cx="32" cy="26" r="14" fill="#f9a8d4" />
      <circle cx="32" cy="26" r="9" fill="#ffffff" />
      <circle cx="19" cy="44" r="6" fill="#f43f5e" />
      <circle cx="32" cy="48" r="6" fill="#a855f7" />
      <circle cx="45" cy="44" r="6" fill="#06b6d4" />
      <circle cx="25" cy="24" r="3" fill="#f43f5e" opacity="0.5" />
      <circle cx="38" cy="22" r="4" fill="#818cf8" opacity="0.5" />
      <circle cx="35" cy="30" r="2.5" fill="#fbbf24" opacity="0.7" />
    </svg>
  );
}

function CartoonCode() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="64" height="64" rx="16" fill="#eff6ff" />
      <rect x="10" y="12" width="44" height="40" rx="8" fill="#1e40af" />
      <rect x="10" y="12" width="44" height="10" rx="8" fill="#2563eb" />
      <circle cx="17" cy="17" r="2.5" fill="#f87171" />
      <circle cx="24" cy="17" r="2.5" fill="#fbbf24" />
      <circle cx="31" cy="17" r="2.5" fill="#4ade80" />
      <rect x="16" y="26" width="12" height="3" rx="1.5" fill="#60a5fa" />
      <rect x="20" y="32" width="18" height="3" rx="1.5" fill="#a5b4fc" />
      <rect x="16" y="38" width="14" height="3" rx="1.5" fill="#60a5fa" />
    </svg>
  );
}

function CartoonChart() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="64" height="64" rx="16" fill="#fffbeb" />
      <rect x="10" y="44" width="9" height="12" rx="3" fill="#f59e0b" />
      <rect x="23" y="34" width="9" height="22" rx="3" fill="#f97316" />
      <rect x="36" y="24" width="9" height="32" rx="3" fill="#ef4444" />
      <rect x="49" y="14" width="9" height="42" rx="3" fill="#8b5cf6" />
      <polyline points="14,46 27,36 40,26 53,16" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="46" r="2.5" fill="#1e293b" />
      <circle cx="27" cy="36" r="2.5" fill="#1e293b" />
      <circle cx="40" cy="26" r="2.5" fill="#1e293b" />
      <circle cx="53" cy="16" r="2.5" fill="#1e293b" />
    </svg>
  );
}

function CartoonServer() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="64" height="64" rx="16" fill="#ecfdf5" />
      <rect x="12" y="10" width="40" height="12" rx="4" fill="#059669" />
      <rect x="12" y="26" width="40" height="12" rx="4" fill="#10b981" />
      <rect x="12" y="42" width="40" height="12" rx="4" fill="#34d399" />
      <circle cx="44" cy="16" r="3" fill="#d1fae5" />
      <circle cx="50" cy="16" r="3" fill="#6ee7b7" />
      <circle cx="44" cy="32" r="3" fill="#d1fae5" />
      <circle cx="50" cy="32" r="3" fill="#6ee7b7" />
      <circle cx="44" cy="48" r="3" fill="#d1fae5" />
      <circle cx="50" cy="48" r="3" fill="#fbbf24" />
    </svg>
  );
}

function CartoonUX() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="64" height="64" rx="16" fill="#f5f3ff" />
      <rect x="8" y="14" width="48" height="36" rx="6" fill="#7c3aed" />
      <rect x="14" y="20" width="18" height="12" rx="3" fill="#c4b5fd" />
      <rect x="14" y="36" width="24" height="4" rx="2" fill="#a78bfa" opacity="0.7" />
      <circle cx="46" cy="26" r="8" fill="#ddd6fe" />
      <circle cx="46" cy="26" r="4" fill="#7c3aed" />
    </svg>
  );
}

const FLOAT_BADGES = [
  { label: 'Product Design', component: CartoonPalette, pos: 'top-36 left-10', delay: '0s', duration: '6s' },
  { label: 'Frontend Dev',   component: CartoonCode,    pos: 'top-52 right-14', delay: '0.5s', duration: '4s' },
  { label: 'Data Analysis',  component: CartoonChart,   pos: 'bottom-36 left-20', delay: '1s', duration: '5.5s' },
  { label: 'Backend Dev',    component: CartoonServer,  pos: 'bottom-44 right-10', delay: '1.5s', duration: '4.5s' },
];

interface Props {
  activeCohortCount: number;
  courseCount: number;
}

export function AcademyHero({ activeCohortCount, courseCount }: Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-[#09090f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-600/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* Floating cartoon badges */}
      {FLOAT_BADGES.map(({ label, component: Cartoon, pos, delay, duration }) => (
        <div
          key={label}
          className={`absolute ${pos} hidden xl:flex items-center gap-3 bg-white/[0.08] border border-white/[0.12] backdrop-blur-md rounded-2xl px-4 py-3`}
          style={{ animation: `floatBadge ${duration} ease-in-out ${delay} infinite` }}
        >
          <div className="w-10 h-10 shrink-0">
            <Cartoon />
          </div>
          <span className="text-white/80 text-sm font-bold">{label}</span>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-[960px] mx-auto px-6 text-center py-32">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-10"
          style={{ animation: 'fadeIn 0.8s ease-out forwards' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Soltec Academy — Live Cohort Learning
          <FiZap className="w-3.5 h-3.5" />
        </div>

        <h1
          className="text-5xl sm:text-7xl lg:text-[88px] font-black text-white leading-[1.0] tracking-tight mb-8"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.1s both' }}
        >
          Build skills that
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            pay real money.
          </span>
        </h1>

        <p
          className="text-slate-400 text-xl font-medium leading-relaxed mb-12 max-w-2xl mx-auto"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
        >
          Join a structured, tutor-led cohort. Live sessions, real projects,
          peer accountability, and a certificate — in just 3 months.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.35s both' }}
        >
          <a
            href="#courses"
            className="inline-flex items-center gap-2 px-9 py-[18px] bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/30 hover:-translate-y-0.5 text-base"
          >
            Browse Tracks <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-9 py-[18px] bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all text-base"
          >
            How It Works
          </a>
        </div>

        {/* Stats */}
        <div
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.5s both' }}
        >
          {[
            { label: 'Skill Tracks', value: `${courseCount}` },
            { label: 'Active Cohorts', value: activeCohortCount > 0 ? `${activeCohortCount}` : 'Soon' },
            { label: 'Class Size', value: '≤ 20' },
            { label: 'Duration', value: '3 Months' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-5 backdrop-blur-sm hover:bg-white/[0.07] transition-all">
              <p className="text-3xl font-black text-white mb-1">{value}</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
