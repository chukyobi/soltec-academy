"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, ArrowRight, Loader2, CheckCircle2,
  GraduationCap, Copy, Check, KeyRound, BadgeCheck,
} from "lucide-react";

type Step = "form" | "verify" | "done";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/student/profile";

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [studentId] = useState(searchParams.get("studentId") ?? "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idCopied, setIdCopied] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/student/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, studentId }),
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
      setTimeout(() => { window.location.href = redirect; }, 1800);
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

  function copyToClipboard(text: string, type: "id" | "otp") {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "id") {
        setIdCopied(true);
        setTimeout(() => setIdCopied(false), 2000);
      } else {
        setOtpCopied(true);
        setTimeout(() => setOtpCopied(false), 2000);
      }
    });
  }

  // Auto-fill OTP digits when clicking "copy" otp
  function fillOtpFromDevCode() {
    if (!devOtp) return;
    const digits = devOtp.split("").slice(0, 6);
    setOtp(digits.concat(Array(6 - digits.length).fill("")));
    otpRefs.current[5]?.focus();
  }

  return (
    <div className="fixed inset-0 flex bg-[#09090f] overflow-hidden">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_65%)]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/"><img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-200" /></Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-20 py-10">
          <div>
            <h2 className="text-6xl font-black text-white leading-tight mb-6">
              Start your<br />learning<br />journey.
            </h2>
            <p className="text-white/65 text-xl leading-relaxed max-w-sm">
              Join thousands of students gaining high-income skills through structured, tutor-led cohorts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "🎨", label: "Product Design" },
              { emoji: "💻", label: "Frontend Dev" },
              { emoji: "⚙️", label: "Backend Dev" },
              { emoji: "📊", label: "Data Analysis" },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-sm">
                <span className="text-xl">{emoji}</span>
                <span className="text-white text-[10px] font-black uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-black">
            Soltec Engineering Ltd. © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 items-center">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
             <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-12">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block mb-10">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto invert brightness-0" />
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

              {/* Student ID badge (read-only, passed from enrollment) */}
              {studentId && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5" /> Your Student ID
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <code className="font-black text-indigo-700 text-base tracking-wider">{studentId}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(studentId, "id")}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1.5 rounded-lg transition-all"
                      title="Copy Student ID"
                    >
                      {idCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      {idCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-400 mt-2 font-medium">Save this ID — you&apos;ll need it to log in.</p>
                </div>
              )}

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
                    readOnly={!!searchParams.get("email")}
                    className={`w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300 ${searchParams.get("email") ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`}
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
              <div className="mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 text-2xl">✉️</div>
                <h1 className="text-3xl font-black text-slate-900">Verify your email</h1>
                <p className="text-slate-500 mt-2 text-sm">
                  A 6-digit code has been sent to <strong className="text-slate-700">{email}</strong>
                </p>
              </div>

              {/* ── Student ID card with copy button ── */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5" /> Your Student ID — Save this!
                </p>
                <div className="flex items-center justify-between gap-3">
                  <code className="font-black text-indigo-800 text-base tracking-widest">{studentId}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(studentId, "id")}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                    title="Copy Student ID"
                  >
                    {idCopied
                      ? <><Check className="w-3 h-3 text-green-600" /> Copied!</>
                      : <><Copy className="w-3 h-3" /> Copy</>
                    }
                  </button>
                </div>
                <p className="text-[10px] text-indigo-400 mt-2 font-medium">
                  You will need this ID every time you log in. Store it somewhere safe.
                </p>
              </div>

              {/* ── OTP display (shown until mailer is active) ── */}
              {devOtp && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 mb-2">
                      <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Your Verification Code</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(devOtp, "otp")}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-all shrink-0"
                      title="Copy OTP"
                    >
                      {otpCopied
                        ? <><Check className="w-3 h-3 text-green-700" /> Copied!</>
                        : <><Copy className="w-3 h-3" /> Copy</>
                      }
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black text-amber-900 tracking-[0.35em] font-mono">{devOtp}</p>
                  </div>
                  <button
                    type="button"
                    onClick={fillOtpFromDevCode}
                    className="mt-3 text-[10px] font-black text-amber-600 hover:text-amber-800 uppercase tracking-widest underline underline-offset-2 transition-colors"
                  >
                    → Auto-fill code into boxes
                  </button>
                </div>
              )}

              {/* OTP input boxes */}
              <div className="flex gap-3 justify-center mb-6">
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
                Verify &amp; Continue <ArrowRight className="w-4 h-4" />
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

            <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest mt-8">
              Secured & Encrypted Registration
            </p>
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
