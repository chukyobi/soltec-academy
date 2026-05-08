"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  FileText, Shield, CreditCard, User, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    bio: "",
    specialty: "",
    website: "",
    legalFullName: "",
    idNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    agreedToTerms: false
  });

  useEffect(() => {
    // Check if user is logged in and if they already have a profile
    async function checkStatus() {
      try {
        const res = await fetch("/api/creator/profile");
        if (!res.ok) {
          if (res.status === 401) router.push("/creator/login");
          return;
        }
        const data = await res.json();
        if (data.profile && data.profile.approvalStatus !== "PENDING") {
           // If already approved or suspended, move to dashboard (dashboard will handle redirects)
           router.push("/creator/dashboard");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setChecking(false);
      }
    }
    checkStatus();
  }, [router]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Onboarding failed");
      
      setStep(5); // Success step
    } catch (e) {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return (
    <div className="fixed inset-0 bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col items-center py-20 px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Progress Header */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-2xl tracking-tight">Creator Onboarding</h2>
          <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Step {step} of 4</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-full flex-1 transition-all duration-500 rounded-full ${s <= step ? 'bg-emerald-500' : 'bg-white/5'}`} 
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-2xl bg-[#0d0d14] border border-white/5 rounded-[40px] p-8 sm:p-12 shadow-2xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <User className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Public Identity</h3>
                <p className="text-slate-500 text-sm">Tell us about your expertise and what you&apos;ll be selling.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialty / Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend Engineering, Product Design"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Short Bio</label>
                  <textarea 
                    placeholder="Briefly describe your experience and teaching style..."
                    rows={4}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website or Portfolio (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.specialty || !formData.bio}
                className="w-full bg-white text-black font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Continue to Legal <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Legal Verification</h3>
                <p className="text-slate-500 text-sm">We need this to ensure compliance and secure payments.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
                  <input 
                    type="text" 
                    placeholder="As it appears on your ID"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500 transition-all"
                    value={formData.legalFullName}
                    onChange={(e) => setFormData({...formData, legalFullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Government ID Number (NIN / Driver License)</label>
                  <input 
                    type="text" 
                    placeholder="ID Number for verification"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500 transition-all"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-white/5 text-slate-400 font-black py-5 rounded-[24px] hover:bg-white/10 transition-all">Back</button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!formData.legalFullName || !formData.idNumber}
                  className="flex-[2] bg-white text-black font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Continue to Financials <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                  <CreditCard className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Payout Details</h3>
                <p className="text-slate-500 text-sm">Where should we send your earnings?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Zenith Bank, Kuda"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-amber-500 transition-all"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Number</label>
                  <input 
                    type="text" 
                    placeholder="10 Digits"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-amber-500 transition-all"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Name</label>
                  <input 
                    type="text" 
                    placeholder="Full name as it is on the bank account"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-amber-500 transition-all"
                    value={formData.accountName}
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 bg-white/5 text-slate-400 font-black py-5 rounded-[24px] hover:bg-white/10 transition-all">Back</button>
                <button 
                  onClick={() => setStep(4)}
                  disabled={!formData.bankName || !formData.accountNumber || !formData.accountName}
                  className="flex-[2] bg-white text-black font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Final Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Creator Agreement</h3>
                <p className="text-slate-500 text-sm">Please review and accept our content selling terms.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-64 overflow-y-auto text-slate-400 text-xs leading-relaxed space-y-4">
                <p className="font-bold text-white">1. PROFIT SHARING</p>
                <p>The standard profit split is 70% for the Creator and 30% for Soltec Academy. This covers hosting, payment processing, and platform maintenance.</p>
                <p className="font-bold text-white">2. CONTENT OWNERSHIP</p>
                <p>You retain full ownership of your IP. By uploading, you grant Soltec Academy a non-exclusive license to host and sell the content on your behalf.</p>
                <p className="font-bold text-white">3. VETTING PROCESS</p>
                <p>All creators and courses are subject to manual approval by the Soltec Admin team. We reserve the right to reject content that doesn&apos;t meet our quality standards.</p>
                <p className="font-bold text-white">4. PAYOUT SCHEDULE</p>
                <p>Payouts are processed on a bi-weekly basis for all cleared funds (funds that have passed the 7-day refund window).</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mt-1 w-5 h-5 rounded-md border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                />
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">I agree to the Creator Terms and Conditions and understand the 70/30 profit sharing model.</span>
              </label>

              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className="flex-1 bg-white/5 text-slate-400 font-black py-5 rounded-[24px] hover:bg-white/10 transition-all">Back</button>
                <button 
                  onClick={handleSubmit}
                  disabled={!formData.agreedToTerms || loading}
                  className="flex-[2] bg-emerald-600 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit Application <Check className="w-5 h-5" /></>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 flex items-center justify-center mb-10 mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-4xl font-black text-white mb-6">Application Submitted!</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto mb-10">
                Our team will review your profile and legal details within the next 24-48 hours. You will receive an email once your account is approved.
              </p>
              <button 
                onClick={() => router.push("/creator/login")}
                className="bg-white text-black font-black px-12 py-5 rounded-3xl hover:bg-slate-200 transition-all shadow-2xl shadow-white/10"
              >
                Return to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
        <Shield className="w-3.5 h-3.5" /> SECURE ONBOARDING
      </div>
    </div>
  );
}
