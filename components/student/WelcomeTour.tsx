"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, GraduationCap, Zap, Play, CheckCircle2, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  userName: string;
  hasSeenWelcome: boolean;
  hasSeenTour: boolean;
}

export function WelcomeTour({ userName, hasSeenWelcome: initialWelcome, hasSeenTour: initialTour }: Props) {
  const [showWelcome, setShowWelcome] = useState(!initialWelcome);
  const [tourStep, setTourStep] = useState<number | null>(null);

  useEffect(() => {
    if (showWelcome) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899"]
      });
    }
  }, [showWelcome]);

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    // Update DB
    await fetch("/api/student/profile/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "hasSeenWelcome" })
    });

    if (!initialTour) {
      setTourStep(0);
    }
  };

  const handleNextTour = async () => {
    if (tourStep === null) return;
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(null);
      // Update DB
      await fetch("/api/student/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "hasSeenTour" })
      });
    }
  };

  const TOUR_STEPS = [
    {
      title: "Your Dashboard",
      text: "This is your learning command center. All your enrolled tracks and progress appear here.",
      target: "body",
      position: "center"
    },
    {
      title: "Track Status",
      text: "Check your payment status and remaining balance for each track at a glance.",
      target: "[data-tour='stats']",
    },
    {
      title: "Classroom Access",
      text: "Click 'Enter Classroom' to access your live sessions, recordings, and curriculum.",
      target: "[data-tour='classroom-btn']",
    }
  ];

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] overflow-hidden max-w-2xl w-full shadow-2xl relative"
            >
              <button 
                onClick={handleCloseWelcome}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 bg-slate-900 relative min-h-[300px]">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                    alt="CEO"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white font-black text-lg leading-tight">Engr. Emeka Obi</p>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-widest">CEO, Soltec Engineering</p>
                  </div>
                </div>

                <div className="md:w-3/5 p-8 sm:p-12">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">
                    Welcome to the<br />Family, {userName.split(" ")[0]}!
                  </h2>
                  <div className="space-y-4 text-slate-600 text-sm leading-relaxed mb-8">
                    <p>
                      We are thrilled to have you join Soltec Academy. You&apos;ve taken a bold step towards mastering industry-demand skills.
                    </p>
                    <p>
                      Our cohorts are designed to be intensive, practical, and community-driven. Don&apos;t just learn—build, network, and excel.
                    </p>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                      <Zap className="w-4 h-4 fill-indigo-600" />
                      <span>Your journey starts today.</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCloseWelcome}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Let&apos;s Get Started <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tourStep !== null && (
          <div className="fixed inset-0 z-[90] pointer-events-none">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
             
             <div className="absolute inset-0 flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto border border-indigo-100"
               >
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                       {tourStep + 1}
                     </div>
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tour Step</span>
                   </div>
                   <div className="flex gap-1">
                     {TOUR_STEPS.map((_, i) => (
                       <div key={i} className={`h-1 w-4 rounded-full ${i === tourStep ? "bg-indigo-600" : "bg-slate-100"}`} />
                     ))}
                   </div>
                 </div>

                 <h3 className="text-xl font-black text-slate-900 mb-2">{TOUR_STEPS[tourStep].title}</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-8">
                   {TOUR_STEPS[tourStep].text}
                 </p>

                 <button 
                   onClick={handleNextTour}
                   className="w-full py-3.5 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all"
                 >
                   {tourStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Got it, Next"} <ChevronRight className="w-4 h-4" />
                 </button>
               </motion.div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
