"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, ArrowRight, Loader2, CheckCircle2,
  Copy, Check, BadgeCheck, RefreshCw,
} from "lucide-react";

type Step = "form" | "verify" | "done";

export default function SignupClient({ 
  initialEmail, 
  initialStudentId, 
  initialRedirect,
  initialStep,
  initialUserId
}: { 
  initialEmail: string, 
  initialStudentId: string, 
  initialRedirect: string,
  initialStep?: Step,
  initialUserId?: string
}) {
  const router = useRouter();
  const redirect = initialRedirect;

  const [step, setStep] = useState<Step>(initialStep || "form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [studentId] = useState(initialStudentId);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState(initialUserId || "");
  const [devOtp, setDevOtp] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idCopied, setIdCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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

  async function handleResendOtp() {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/student/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCooldown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resend code");
    } finally {
      setResending(false);
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

  function copyToClipboard(text: string, type: "id") {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "id") {
        setIdCopied(true);
        setTimeout(() => setIdCopied(false), 2000);
      }
    });
  }

  return (
    <div className="fixed inset-0 flex bg-[#09090f] overflow-hidden font-sans">
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-16 relative overflow-hidden border-r border-white/5 bg-[#0d0d14]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

        <div className="relative z-10">
          <Link href="/">
             <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-0 invert opacity-90" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="mb-16 space-y-6">
             <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Student Onboarding
             </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Start your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">learning journey.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
              Join elite engineering cohorts, build real-world projects, and master high-income tech skills.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Product Design", icon: "🎨" },
              { label: "Frontend Dev", icon: "💻" },
              { label: "Backend Dev", icon: "⚙️" },
              { label: "Data Analysis", icon: "📊" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                <span className="text-xl">{icon}</span>
                <span className="text-white text-[10px] font-black uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between pt-8 border-t border-white/5">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
            Soltec Academy © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">System Online</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-[#09090f] relative overflow-y-auto">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-[420px] relative z-10 py-12">
          <Link href="/" className="lg:hidden block mb-12 text-center">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto brightness-0 invert opacity-90 mx-auto" />
          </Link>

          {step === "form" && (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-white tracking-tight">Create your account</h1>
                <p className="text-slate-400 mt-2 text-sm font-medium">
                  Already have an account?{" "}
                  <Link
                    href={`/student/login?redirect=${encodeURIComponent(redirect)}`}
                    className="text-violet-400 font-bold hover:text-violet-300 transition-colors"
                  >
                    Sign in →
                  </Link>
                </p>
              </div>

              {studentId && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 mb-8">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4" /> Your Assigned Student ID
                  </p>
                  <div className="flex items-center justify-between gap-3 bg-[#0d0d14] rounded-xl p-3 border border-white/5">
                    <code className="font-mono font-black text-white text-base tracking-widest">{studentId}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(studentId, "id")}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-violet-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
                    >
                      {idCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {idCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 font-medium uppercase tracking-widest">Store this safely for future logins.</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5 bg-[#0d0d14] p-8 rounded-[32px] border border-white/5 shadow-2xl">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Emeka Obi"
                    required
                    className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-slate-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    readOnly={!!initialEmail}
                    className={`w-full bg-[#13131a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-slate-600 font-medium ${initialEmail ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-slate-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {[8, 12, 16].map((threshold, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          password.length >= threshold
                            ? i === 0 ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" : i === 1 ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                            : "bg-white/5"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-red-400 text-xs font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <div className="bg-[#0d0d14] p-8 rounded-[32px] border border-white/5 shadow-2xl">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/20">
                  <span className="text-2xl">✉️</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Verify email</h1>
                <p className="text-slate-400 mt-3 text-sm font-medium">
                  A 6-digit code has been sent to <br />
                  <strong className="text-white bg-white/5 px-2 py-1 rounded-md mt-2 inline-block">{email}</strong>
                </p>
              </div>

              <div className="flex gap-3 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-12 h-14 bg-[#13131a] text-center text-2xl font-black text-white border border-white/10 rounded-xl focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending || cooldown > 0}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-violet-400 disabled:opacity-50 transition-colors"
                >
                  {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-red-400 text-xs font-bold flex items-center justify-center gap-2 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}

              <button
                id="otp-verify-btn"
                onClick={handleVerify}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 uppercase tracking-widest"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-center text-slate-500 text-xs mt-6 font-medium">
                Wrong email?{" "}
                <button onClick={() => setStep("form")} className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
                  Go back
                </button>
              </p>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === "done" && (
            <div className="bg-[#0d0d14] p-12 rounded-[32px] border border-white/5 shadow-2xl text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Access Granted.</h2>
              <p className="text-slate-400 text-sm font-medium">Your portal is ready. Redirecting you now...</p>
              <div className="mt-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
              </div>
            </div>
          )}

          <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-10">
            Secured & Encrypted Registration
          </p>
        </div>
      </div>
    </div>
  );
}


