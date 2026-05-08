"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, BookOpen, TrendingUp, CreditCard, Sparkles } from "lucide-react";

const PERKS = [
  { icon: BookOpen, label: "View your enrolled cohorts" },
  { icon: TrendingUp, label: "Track learning progress" },
  { icon: CreditCard, label: "Manage payment balance" },
  { icon: Sparkles, label: "Access class materials" },
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

      if (data.needsVerification) {
        // Redirect to signup page but force it to the verify step
        router.push(`/student/signup?userId=${data.userId}&step=verify`);
        return;
      }

      window.location.href = redirect;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex bg-[#09090f] overflow-hidden font-sans">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-16 relative overflow-hidden border-r border-white/5 bg-[#0d0d14]">
        {/* Glow effects */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
             <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-0 invert opacity-90" />
          </Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="mb-16 space-y-6">
             <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Student Portal
             </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Welcome back to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">your future.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
              Access your personalized learning environment, track your progress, and master your craft.
            </p>
          </div>

          <div className="grid gap-6">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-slate-300 text-sm font-bold tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between pt-8 border-t border-white/5">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
            Soltec Academy © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Secure Network</span>
             </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#09090f] relative overflow-y-auto">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block mb-12">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto brightness-0 invert opacity-90" />
          </Link>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">Sign In</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 bg-[#0d0d14] p-8 rounded-[32px] border border-white/5 shadow-2xl">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                Email or Student ID
              </label>
              <input
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or STU-..."
                required
                className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                <Link href="/student/forgot-password" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold tracking-widest uppercase transition-colors">
                  Reset
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-red-400 text-xs font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center bg-[#0d0d14] p-5 rounded-2xl border border-white/5">
            <p className="text-slate-400 text-xs font-medium mb-3">
              Don&apos;t have an account?
            </p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
              To create an account, you must first enroll in a track or cohort.
              <br />
              <Link href="/academy" className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 mt-3">
                Explore Academy <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
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
