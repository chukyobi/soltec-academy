"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const role = searchParams.get("role");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token || !role) {
    return (
      <div className="bg-[#0d0d14] rounded-[32px] p-10 border border-red-500/20 text-center max-w-md w-full">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Invalid Reset Link</h2>
        <p className="text-slate-400 text-sm mb-8">This link is missing required parameters or is malformed.</p>
        <Link href="/" className="text-indigo-400 font-bold hover:underline">Return to Home</Link>
      </div>
    );
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, role, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  const loginUrl = role === "student" ? "/student/login" : role === "tutor" ? "/tutor/login" : "/admin";

  return (
    <div className="bg-[#0d0d14] rounded-[32px] p-8 sm:p-10 border border-white/5 shadow-2xl max-w-md w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">New Password</h1>
        <p className="text-slate-400 text-sm font-medium">Create a strong password for your account.</p>
      </div>

      {success ? (
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Success!</h3>
          <p className="text-slate-400 text-sm mb-10">Your password has been successfully updated.</p>
          <Link 
            href={loginUrl}
            className="block w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl transition-all uppercase tracking-widest"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">New Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col items-center justify-center p-6 font-sans">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-indigo-500" />}>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
        Soltec Academy Security © {new Date().getFullYear()}
      </p>
    </div>
  );
}
