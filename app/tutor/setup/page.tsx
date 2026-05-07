"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function TutorSetupPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tutor/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Success! Go to dashboard
      router.push("/tutor/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <Link href="/"><img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto mx-auto brightness-200 mb-8" /></Link>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Security Update Required</h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            Welcome to Soltec! For your security, please update your temporary password before accessing your dashboard.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input
                type={show ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Secure My Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/[0.05] flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              AES-256 Encryption
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Secure Session
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-600 text-xs font-bold">
          Technical issues? Contact <a href="mailto:support@soltec.ng" className="text-teal-500 hover:underline">support@soltec.ng</a>
        </p>
      </div>
    </div>
  );
}
