"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function CreatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.userId) {
          router.push(`/studio/signup?verify=${data.userId}`);
          return;
        }
        setError(data.error);
        return;
      }
      router.push(data.needsOnboarding ? "/studio/onboarding" : "/studio");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-lg" />
            <span className="text-white font-bold text-xl tracking-tight">Soltec Studio</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome back,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Creator.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-sm">Your students are waiting. Sign in to manage your courses and track your earnings.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Sign in</h2>
          <p className="text-slate-500 mb-8">To your creator studio</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="you@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-12"
                  placeholder="Your password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/studio/signup" className="text-indigo-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
