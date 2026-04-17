"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Palette, Database, Globe, Cpu, BookOpen, Video, BarChart2 } from "lucide-react";

const SPECIALTIES = [
  { id: "frontend", label: "Frontend Dev", icon: Code2, color: "text-blue-500" },
  { id: "backend", label: "Backend Dev", icon: Database, color: "text-green-500" },
  { id: "design", label: "UI/UX Design", icon: Palette, color: "text-purple-500" },
  { id: "data", label: "Data Science", icon: BarChart2, color: "text-orange-500" },
  { id: "devops", label: "DevOps / Cloud", icon: Globe, color: "text-cyan-500" },
  { id: "ai", label: "AI / ML", icon: Cpu, color: "text-pink-500" },
  { id: "content", label: "Content Creation", icon: Video, color: "text-red-500" },
  { id: "other", label: "Other", icon: BookOpen, color: "text-slate-500" },
];

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [website, setWebsite] = useState("");

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/studio/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, specialty, website }),
      });
      setStep(3);
      setTimeout(() => router.push("/studio"), 1800);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4 py-16">
      {/* Background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-xl">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-indigo-500" : "bg-white/10"}`} />
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">

          {/* Step 0: Bio */}
          {step === 0 && (
            <div>
              <span className="text-4xl mb-4 block">👋</span>
              <h1 className="text-2xl font-black text-white mb-2">Tell us about yourself</h1>
              <p className="text-slate-400 mb-6 text-sm">Your bio appears on your course pages and creator profile.</p>
              <textarea
                value={bio} onChange={e => setBio(e.target.value)}
                rows={4} maxLength={300}
                placeholder="I&apos;m a software engineer with 8 years of experience in React and Node.js. I love breaking down complex concepts into simple, actionable lessons..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none text-sm leading-relaxed"
              />
              <p className="text-right text-xs text-slate-500 mt-1">{bio.length}/300</p>
              <button onClick={() => setStep(1)}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition">
                Continue →
              </button>
            </div>
          )}

          {/* Step 1: Specialty */}
          {step === 1 && (
            <div>
              <span className="text-4xl mb-4 block">🎯</span>
              <h1 className="text-2xl font-black text-white mb-2">What do you teach?</h1>
              <p className="text-slate-400 mb-6 text-sm">Pick the area that best describes your expertise.</p>
              <div className="grid grid-cols-2 gap-3">
                {SPECIALTIES.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id} onClick={() => setSpecialty(id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition text-left ${
                      specialty === id
                        ? "border-indigo-500 bg-indigo-500/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                    }`}>
                    <Icon className={`w-5 h-5 shrink-0 ${specialty === id ? "text-indigo-400" : color}`} />
                    <span className="text-sm font-semibold">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="flex-1 border border-white/10 text-slate-300 font-bold py-3 rounded-xl hover:bg-white/5 transition text-sm">
                  ← Back
                </button>
                <button onClick={() => setStep(2)} disabled={!specialty}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Links */}
          {step === 2 && (
            <div>
              <span className="text-4xl mb-4 block">🔗</span>
              <h1 className="text-2xl font-black text-white mb-2">Add your links</h1>
              <p className="text-slate-400 mb-6 text-sm">Optional — add your website or portfolio so students can learn more about you.</p>
              <input
                type="url" value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-slate-300 font-bold py-3 rounded-xl hover:bg-white/5 transition text-sm">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm">
                  {loading ? "Setting up…" : "🚀 Launch my Studio"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-6">🎬</div>
              <h1 className="text-2xl font-black text-white mb-2">Your studio is ready!</h1>
              <p className="text-slate-400 text-sm">Taking you to your creator dashboard…</p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
