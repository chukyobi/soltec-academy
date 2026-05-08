"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

// ── Cartoon SVG illustrations ─────────────────────────────────────────────────
function CartoonGradCap() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" rx="14" fill="rgba(255,255,255,0.15)" />
      <polygon points="28,14 46,22 28,30 10,22" fill="white" opacity="0.9" />
      <rect x="25" y="30" width="6" height="10" rx="2" fill="white" opacity="0.7" />
      <ellipse cx="31" cy="40" rx="6" ry="3" fill="white" opacity="0.6" />
      <rect x="44" y="22" width="3" height="10" rx="1.5" fill="white" opacity="0.7" />
      <circle cx="45.5" cy="33" r="2.5" fill="#fbbf24" />
    </svg>
  );
}

function CartoonStar() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="rgba(255,255,255,0.12)" />
      <polygon points="22,8 25,18 36,18 27,24 30,34 22,28 14,34 17,24 8,18 19,18" fill="#fbbf24" opacity="0.9" />
    </svg>
  );
}

function CartoonBook() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="10" y="10" width="24" height="28" rx="3" fill="#a5b4fc" />
      <rect x="10" y="10" width="5" height="28" rx="2" fill="#6366f1" />
      <rect x="18" y="16" width="12" height="2.5" rx="1.25" fill="white" opacity="0.5" />
      <rect x="18" y="21" width="10" height="2.5" rx="1.25" fill="white" opacity="0.5" />
      <rect x="18" y="26" width="8" height="2.5" rx="1.25" fill="white" opacity="0.5" />
    </svg>
  );
}

function CartoonCheck() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="rgba(255,255,255,0.12)" />
      <circle cx="22" cy="22" r="14" fill="#4ade80" opacity="0.5" />
      <polyline points="14,22 20,28 32,16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartoonPayment() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="8" y="14" width="28" height="18" rx="4" fill="#6ee7b7" opacity="0.5" />
      <rect x="8" y="18" width="28" height="5" fill="white" opacity="0.3" />
      <circle cx="14" cy="25" r="3" fill="white" opacity="0.6" />
      <rect x="20" y="24" width="10" height="2.5" rx="1.25" fill="white" opacity="0.4" />
    </svg>
  );
}

const PERKS = [
  { cartoon: CartoonBook, label: "View your enrolled cohorts" },
  { cartoon: CartoonCheck, label: "Track learning progress" },
  { cartoon: CartoonPayment, label: "Manage payment balance" },
  { cartoon: CartoonStar, label: "Access class materials" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/student/profile";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex bg-[#09090f] overflow-hidden">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.12),transparent_65%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/"><img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-200" /></Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-20">
          <div className="mb-20">
            <h2 className="text-7xl font-black text-white leading-tight mb-8 flex flex-wrap items-center gap-x-4">
              <span>Welcome</span> <span>back.</span>
            </h2>
            <p className="text-white/70 text-2xl leading-relaxed max-w-lg font-medium">
              Access your personalized learning portal, track your cohort progress, and continue your engineering journey.
            </p>
          </div>

          {/* Perks with cartoon icons - Spaced out */}
          <div className="grid gap-10">
            {PERKS.map(({ cartoon: Cartoon, label }) => (
              <div key={label} className="flex items-center gap-6 group">
                <div className="w-16 h-16 shrink-0 transition-transform group-hover:scale-110 duration-300">
                  <Cartoon />
                </div>
                <span className="text-white/90 text-lg font-black uppercase tracking-[0.2em]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between pt-10 border-t border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-black">
            Soltec Engineering Academy © {new Date().getFullYear()}
          </p>
          <div className="flex gap-6 items-center">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Network Secure</span>
             </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-10">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block mb-10">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto invert brightness-0" />
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sign in</h1>
            <p className="text-slate-500 mt-3 text-sm font-medium">
              Access your student dashboard and classroom materials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Email or Student ID
              </label>
              <input
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or STU-2026-XXXX"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300 bg-slate-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                <Link href="/student/forgot-password" className="text-xs text-indigo-500 hover:underline font-bold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300 bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Authorized Student Access Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
