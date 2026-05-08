"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, Loader2, Mail, Lock, User, 
  ShieldCheck, Rocket, Zap, Globe, DollarSign 
} from "lucide-react";

export default function CreatorSignup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/creator/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Redirect to login after successful signup
      router.push("/creator/login?msg=Account created! Please sign in to complete onboarding.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex bg-[#09090f] overflow-hidden font-sans">
      {/* Left side - Branded Info */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-16 relative overflow-hidden border-r border-white/5 bg-[#0d0d14]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/">
             <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-10 w-auto brightness-0 invert opacity-90" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="mb-16 space-y-6">
             <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Creator Studio
             </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Teach. Inspire. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Earn.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
              Join our elite group of digital sellers. Share your expertise, reach thousands, and earn sustainable income.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, label: "70% Profit Share", desc: "You keep the majority of every sale." },
              { icon: Globe, label: "Global Reach", desc: "Access students from all over the world." },
              { icon: ShieldCheck, label: "Vetted Community", desc: "High-quality platform for high-quality creators." },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-black uppercase tracking-widest">{label}</p>
                  <p className="text-slate-500 text-xs mt-1 font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
            Soltec Creator Network © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#09090f] relative overflow-y-auto">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-[420px] relative z-10 py-12">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Become a Creator</h1>
            <p className="text-slate-500 font-medium">Start your journey as a digital content seller.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  required
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-600/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Get Started <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm font-medium">
            Already have a creator account?{" "}
            <Link href="/creator/login" className="text-emerald-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
