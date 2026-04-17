"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, GraduationCap, BookOpen, Users, Award } from "lucide-react";

function TutorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/tutor/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/tutor/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(redirect);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden bg-[#0f0e17]">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/30 via-emerald-600/20 to-cyan-600/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white font-black text-xl tracking-tight">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            Soltec Tutor Portal
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-5">
              Your<br />classroom<br />awaits.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-xs">
              Sign in to manage your cohorts, engage students, and track their progress in real time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: "Manage Students" },
              { icon: BookOpen, label: "Course Materials" },
              { icon: Award, label: "Grade Assignments" },
              { icon: GraduationCap, label: "Track Progress" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-white/70 text-xs font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">
          Soltec Engineering Ltd. © {new Date().getFullYear()}
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-16">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-slate-900 font-black text-lg mb-8">
            <GraduationCap className="w-5 h-5 text-teal-600" />
            Soltec Tutor Portal
          </Link>

          <div className="mb-8">
            <div className="inline-block bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Tutor Access
            </div>
            <h1 className="text-3xl font-black text-slate-900">Sign in</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Use the credentials your admin provided.{" "}
              <Link href="/student/login" className="text-slate-400 hover:underline">
                Student? Sign in here →
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                id="tutor-email"
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tutor@soltec.ng" required
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="tutor-password"
                  type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-300"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">{error}</div>
            )}

            <button
              id="tutor-login-submit"
              type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-90 disabled:opacity-60 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign In to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TutorLoginPage() {
  return (
    <Suspense>
      <TutorLoginForm />
    </Suspense>
  );
}
