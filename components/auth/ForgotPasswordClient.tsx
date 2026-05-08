"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

interface Props {
  role: "student" | "tutor" | "admin";
  portalName: string;
  loginUrl: string;
}

export default function ForgotPasswordClient({ role, portalName, loginUrl }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <Link href={loginUrl} className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="bg-[#0d0d14] rounded-[32px] p-8 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Reset Password</h1>
            <p className="text-slate-400 text-sm font-medium">
              Enter your registered email for the {portalName} portal.
            </p>
          </div>

          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-white">Check your email</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                If an account exists for <span className="text-white font-bold">{email}</span>, we&apos;ve sent a password reset link.
              </p>
              <Link 
                href={loginUrl}
                className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black text-sm rounded-2xl transition-all uppercase tracking-widest mt-8 border border-white/10"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-[#13131a] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-medium"
                  />
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
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Soltec Academy Security © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
