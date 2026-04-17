"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, GraduationCap } from "lucide-react";

type Step = "form" | "verify" | "done";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/student/profile";

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/student/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserId(data.userId);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/student/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otp.join("") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
      setTimeout(() => router.push(redirect), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(i: number, val: string) {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  return (
    <div className="fixed inset-0 flex bg-[#09090f] overflow-hidden">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_65%)]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white font-black text-xl tracking-tight">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            Soltec Academy
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-5">
              Start your<br />learning<br />journey.
            </h2>
            <p className="text-white/65 text-lg leading-relaxed max-w-xs">
              Join thousands of students gaining high-income skills through structured, tutor-led cohorts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "🎨", label: "Product Design" },
              { emoji: "✨", label: "UI/UX Design" },
              { emoji: "📊", label: "Data Analysis" },
              { emoji: "💻", label: "Frontend Dev" },
              { emoji: "⚙️", label: "Backend Dev" },
              { emoji: "🎓", label: "Certificate" },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5">
                <span className="text-lg">{emoji}</span>
                <span className="text-white/80 text-xs font-bold">{label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            {[
              "Live tutor-led cohorts",
              "Real projects & portfolio pieces",
              "Industry-recognised certificates",
              "Career support & alumni network",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />
                <span className="text-white/70 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          Soltec Engineering Ltd. © {new Date().getFullYear()}
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-slate-900 font-black text-lg mb-8">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Soltec Academy
          </Link>

          {/* ── Step 1: Form ── */}
          {step === "form" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Create your account</h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Already have an account?{" "}
                  <Link
                    href={`/student/login?redirect=${encodeURIComponent(redirect)}`}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign in →
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Emeka Obi"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  <div className="mt-2 flex gap-1">
                    {[8, 12, 16].map((threshold, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= threshold
                            ? i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : "bg-green-500"
                            : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  id="signup-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-60 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: OTP Verify ── */}
          {step === "verify" && (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 text-2xl">✉️</div>
                <h1 className="text-3xl font-black text-slate-900">Verify your email</h1>
                <p className="text-slate-500 mt-2 text-sm">
                  We sent a 6-digit code to <strong className="text-slate-700">{email}</strong>
                </p>
                {devOtp && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 font-bold">
                    Dev mode OTP: <span className="font-black text-amber-900">{devOtp}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-12 h-14 text-center text-2xl font-black border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-indigo-50 transition-all"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium mb-5 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                id="otp-verify-btn"
                onClick={handleVerify}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-60 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Verify & Continue <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-slate-400 text-xs mt-5">
                Didn&apos;t get the code? Check spam or{" "}
                <button onClick={() => setStep("form")} className="text-indigo-600 font-bold hover:underline">
                  go back
                </button>
              </p>
            </>
          )}

          {/* ── Step 3: Done ── */}
          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome to Soltec! 🎉</h2>
              <p className="text-slate-500 text-sm">Your account is ready. Redirecting you now...</p>
              <div className="mt-6 flex justify-center">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
            </div>
          )}

          {step !== "done" && (
            <p className="text-center text-slate-400 text-xs mt-8">
              By creating an account you agree to our{" "}
              <Link href="/privacy" className="hover:underline text-slate-500">Privacy Policy</Link>
              {" "}and{" "}
              <Link href="/terms" className="hover:underline text-slate-500">Terms of Service</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentSignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
