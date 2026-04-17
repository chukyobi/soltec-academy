"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Zap, Users, TrendingUp, Star } from "lucide-react";

const STEPS = ["Account", "Verify Email", "Done"];

export default function CreatorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 0 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 1 fields
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userId, setUserId] = useState("");

  // ── Step 0: Sign up ─────────────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUserId(data.userId);
      if (data.devOtp) {
        // Pre-fill OTP in dev mode
        const digits = data.devOtp.split("");
        setOtp(digits);
      }
      setStep(1);
    } finally { setLoading(false); }
  }

  // ── Step 1: Verify OTP ──────────────────────────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otp.join("") }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep(2);
      setTimeout(() => router.push("/studio/onboarding"), 1500);
    } finally { setLoading(false); }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  const PERKS = [
    { icon: Zap, label: "Instant Publishing", desc: "Go live after approval" },
    { icon: Users, label: "Massive Reach", desc: "10,000+ active learners" },
    { icon: TrendingUp, label: "Revenue Analytics", desc: "Real-time earnings dashboard" },
    { icon: Star, label: "Creator Badge", desc: "Verified instructor status" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: value prop ── */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* animated blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-lg" />
            <span className="text-white font-bold text-xl tracking-tight">Soltec Studio</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              Creator Platform
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4">
              Share what you<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">know. Earn.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Join thousands of creators on Soltec Academy. Upload your course, set your price, and start earning today.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {PERKS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i < step ? "bg-indigo-600 text-white"
                  : i === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-gray-100 text-gray-400"
                }`}>{i < step ? "✓" : i + 1}</div>
                <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-indigo-600" : "text-gray-400"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 w-8 ${i < step ? "bg-indigo-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* ── Step 0: Create account ── */}
          {step === 0 && (
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Create your account</h2>
              <p className="text-slate-500 mb-8">Start your creator journey in seconds.</p>

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-12"
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                  {loading ? "Creating account…" : <><span>Create Creator Account</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{" "}
                <Link href="/studio/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── Step 1: Verify email ── */}
          {step === 1 && (
            <div>
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 mb-8">
                We sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span>
              </p>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex gap-3 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                      maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !digit && i > 0)
                          document.getElementById(`otp-${i - 1}`)?.focus();
                      }}
                      className="w-12 h-14 text-center text-2xl font-black border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-slate-900"
                    />
                  ))}
                </div>

                {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={loading || otp.join("").length < 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>
              </form>

              <button onClick={() => setStep(0)} className="text-slate-400 text-sm mt-4 w-full text-center hover:text-slate-600">
                ← Use a different email
              </button>
            </div>
          )}

          {/* ── Step 2: Done ── */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">You&apos;re in!</h2>
              <p className="text-slate-500">Setting up your creator studio…</p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
