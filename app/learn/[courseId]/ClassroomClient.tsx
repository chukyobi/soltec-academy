"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Play, ChevronRight, Trophy, Clock, BookOpen } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fileUrl: string;
  isFree: boolean;
}

interface ProgressRecord {
  videoId: string;
  completed: boolean;
  progressSec: number;
}

interface Props {
  course: {
    id: string;
    title: string;
    creatorName: string;
    videos: Video[];
  };
  progressMap: Record<string, ProgressRecord>;
  enrollmentId: string;
}

export default function ClassroomClient({ course, progressMap, enrollmentId }: Props) {
  const [currentIdx, setCurrentIdx] = useState(() => {
    // Resume from first incomplete video
    const firstIncomplete = course.videos.findIndex(v => !progressMap[v.id]?.completed);
    return firstIncomplete === -1 ? 0 : firstIncomplete;
  });
  const [localProgress, setLocalProgress] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.entries(progressMap).map(([k, v]) => [k, v.completed]))
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const current = course.videos[currentIdx];
  const completed = Object.values(localProgress).filter(Boolean).length;
  const total = course.videos.length;
  const allDone = completed === total;

  // Debounced progress save
  const saveProgress = useCallback(async (videoId: string, progressSec: number, done: boolean) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/learn/${course.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, progressSec, completed: done }),
      });
      if (done) setLocalProgress(prev => ({ ...prev, [videoId]: true }));
    }, 1500);
  }, [course.id]);

  // Mark video complete when it ends
  const onVideoEnded = useCallback(() => {
    if (!current) return;
    saveProgress(current.id, Math.floor(videoRef.current?.duration ?? 0), true);
    setLocalProgress(prev => ({ ...prev, [current.id]: true }));
    // Auto-advance after 2s
    setTimeout(() => {
      if (currentIdx < course.videos.length - 1) setCurrentIdx(i => i + 1);
    }, 2000);
  }, [current, currentIdx, course.videos.length, saveProgress]);

  // Track progress every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && current) {
        saveProgress(current.id, Math.floor(videoRef.current.currentTime), false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [current, saveProgress]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <header className="bg-slate-900 border-b border-white/5 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition">← Exit</Link>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <p className="text-white font-bold text-sm truncate max-w-[300px]">{course.title}</p>
            <p className="text-slate-500 text-xs">{course.creatorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress pill */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <span className="text-slate-400">{completed}/{total}</span>
          </div>
          {allDone && (
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-3 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5" /> Completed!
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Video Player ── */}
        <div className="flex-1 flex flex-col bg-black">
          {current ? (
            <>
              <div className="flex-1 flex items-center justify-center bg-slate-950">
                <video
                  ref={videoRef}
                  key={current.id}
                  src={current.fileUrl}
                  controls
                  onEnded={onVideoEnded}
                  className="w-full max-h-[calc(100vh-200px)] object-contain"
                  autoPlay
                />
              </div>
              <div className="bg-slate-900 px-8 py-5 border-t border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                        EP {current.order}
                      </span>
                      {localProgress[current.id] && (
                        <span className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-black text-white">{current.title}</h2>
                    {current.description && (
                      <p className="text-slate-400 text-sm mt-1">{current.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                      disabled={currentIdx === 0}
                      className="px-4 py-2 text-sm font-bold text-slate-400 border border-white/10 rounded-lg hover:text-white disabled:opacity-30 transition"
                    >← Prev</button>
                    <button
                      onClick={() => setCurrentIdx(i => Math.min(total - 1, i + 1))}
                      disabled={currentIdx === total - 1}
                      className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-30 transition flex items-center gap-1"
                    >Next <ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              No video selected
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className={`${sidebarOpen ? "w-80" : "w-0"} shrink-0 bg-slate-900 border-l border-white/5 flex flex-col overflow-hidden transition-all duration-300`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Course Content
            </div>
            <span className="text-xs text-slate-500">{completed}/{total} done</span>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {course.videos.map((v, i) => {
              const isDone = localProgress[v.id];
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={v.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition group ${
                    isCurrent
                      ? "bg-indigo-600/20 border-l-2 border-indigo-500"
                      : "hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : isCurrent ? (
                      <Play className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-sm font-semibold truncate ${isCurrent ? "text-white" : isDone ? "text-slate-400" : "text-slate-300"}`}>
                      {v.order}. {v.title}
                    </p>
                    {v.isFree && (
                      <span className="text-[10px] text-green-400 font-bold">Free Preview</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {allDone && (
            <div className="p-4 border-t border-white/5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                <Trophy className="w-4 h-4" /> Course Complete!
              </div>
              <p className="text-slate-400 text-xs mt-1">You&apos;ve finished all {total} lessons. 🎉</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
