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

  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email: email.trim(), password }),
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
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.12),transparent_65%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl" />

        {/* Logo with cartoon grad cap */}
        <div className="relative z-10 flex items-center gap-3">
          <CartoonGradCap />
          <Link href="/" className="text-white font-black text-xl tracking-tight">Soltec Academy</Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-4">
              Welcome<br />back.
            </h2>
            <p className="text-white/65 text-lg leading-relaxed max-w-xs">
              Sign in to access your cohort classes, track your progress, and manage your enrollment.
            </p>
          </div>

          {/* Perks with cartoon icons */}
          <div className="space-y-3">
            {PERKS.map(({ cartoon: Cartoon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-11 h-11 shrink-0">
                  <Cartoon />
                </div>
                <span className="text-white/75 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5">
            <p className="text-white/80 text-sm leading-relaxed italic mb-3">
              &ldquo;Soltec Academy was structured exactly how I needed. The tutor was incredible.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white font-black text-xs">C</div>
              <div>
                <p className="text-white font-bold text-xs">Chidi O.</p>
                <p className="text-white/50 text-[10px]">UI/UX Designer</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          Soltec Engineering Ltd. © {new Date().getFullYear()}
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-10">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-slate-900 font-black text-lg mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            Soltec Academy
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">Sign in</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Don&apos;t have an account?{" "}
              <Link href={`/student/signup?redirect=${encodeURIComponent(redirect)}`} className="text-indigo-600 font-bold hover:underline">
                Create one free →
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
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

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <p className="text-indigo-700 text-xs font-black uppercase tracking-wider mb-2">Demo Credentials</p>
            <p className="text-indigo-600 text-xs font-mono">emeka.obi@student.ng</p>
            <p className="text-indigo-500 text-xs font-mono">Student@1234</p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-slate-400 text-xs">Are you a tutor or creator?</p>
            <div className="flex justify-center gap-4">
              <Link href="/tutor/login" className="text-sm text-purple-600 font-bold hover:underline">Tutor Portal →</Link>
              {/*<Link href="/studio/login" className="text-sm text-indigo-600 font-bold hover:underline">Creator Studio →</Link>*/}
            </div>
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
