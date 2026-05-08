"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, GraduationCap, Zap, Play, CheckCircle2, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

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

  useEffect(() => {
    if (tourStep === 0) {
      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        animate: true,
        overlayColor: "rgba(0, 0, 0, 0.85)",
        stagePadding: 10,
        popoverClass: 'soltec-driver-popover',
        steps: [
          { 
            popover: { 
              title: "Welcome to Soltec Academy! 🚀", 
              description: "Let's take a quick 1-minute tour of your new high-performance learning command center." 
            } 
          },
          { 
            element: '[data-tour="stats"]', 
            popover: { 
              title: "Real-time Metrics", 
              description: "Monitor your active tracks and pending tasks. Keep these numbers moving to accelerate your growth!" 
            } 
          },
          { 
            element: '[data-tour="tracks"]', 
            popover: { 
              title: "Industry Tracks", 
              description: "This is where your enrolled cohorts live. Each track is a gateway to a high-demand tech career." 
            } 
          },
          { 
            element: '[data-tour="classroom-btn"]', 
            popover: { 
              title: "Enter the Classroom ⚡", 
              description: "Your main gateway. Access live sessions, collaborate with mentors, and dive into the curriculum here." 
            } 
          },
          { 
            element: '[data-tour="assignments"]', 
            popover: { 
              title: "Priority Missions", 
              description: "Assignments from your tutors appear here. Submit on time to keep your academic standing 'In Training'." 
            } 
          },
          {
            popover: {
              title: "You're All Set! ✨",
              description: "Master your craft, build the future, and enjoy your journey with Soltec Academy."
            }
          }
        ],
        onDestroyStarted: () => {
          driverObj.destroy();
          // Update DB
          fetch("/api/student/profile/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field: "hasSeenTour" })
          });
          setTourStep(null);
        }
      });
      
      // Delay slightly to ensure elements are mounted before tour starts
      setTimeout(() => driverObj.drive(), 500);
    }
  }, [tourStep]);

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

    </>
  );
}

const styles = `
  .soltec-driver-popover {
    background: #0d0d14 !important;
    color: white !important;
    border-radius: 24px !important;
    padding: 24px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
    max-width: 320px !important;
    backdrop-filter: blur(16px);
  }

  .soltec-driver-popover .driver-popover-title {
    font-family: inherit !important;
    font-weight: 900 !important;
    font-size: 18px !important;
    color: white !important;
    margin-bottom: 8px !important;
    letter-spacing: -0.025em !important;
  }

  .soltec-driver-popover .driver-popover-description {
    font-family: inherit !important;
    font-size: 14px !important;
    color: #94a3b8 !important;
    line-height: 1.6 !important;
  }

  .soltec-driver-popover .driver-popover-progress-text {
    color: #6366f1 !important;
    font-weight: 900 !important;
    font-size: 10px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
  }

  .soltec-driver-popover .driver-popover-footer button {
    background: #6366f1 !important;
    color: white !important;
    text-shadow: none !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 800 !important;
    font-size: 12px !important;
    padding: 8px 16px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    transition: all 0.2s ease !important;
  }

  .soltec-driver-popover .driver-popover-footer button:hover {
    background: #4f46e5 !important;
    transform: translateY(-1px) !important;
  }

  .soltec-driver-popover .driver-popover-arrow {
    border-bottom-color: #0d0d14 !important;
    border-top-color: #0d0d14 !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}

