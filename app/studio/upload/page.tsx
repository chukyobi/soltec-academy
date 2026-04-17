"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import {
  Upload, Film, GripVertical, Trash2, Eye, EyeOff,
  ChevronUp, ChevronDown, AlertCircle, CheckCircle2,
  FileVideo, Loader2, ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VideoItem {
  id: string;
  fileName: string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  file: File;
  fileUrl?: string;
  uploading?: boolean;
  uploaded?: boolean;
}

type Stage = "drop" | "preview" | "submitting" | "done";

export default function UploadCoursePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("drop");
  const [dragging, setDragging] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Parse ZIP ────────────────────────────────────────────────────────────────
  const processZip = useCallback(async (file: File) => {
    setError("");
    try {
      const zip = await JSZip.loadAsync(file);
      const videoFiles: File[] = [];

      // Extract video files (mp4, mov, mkv, webm, avi)
      const VIDEO_EXT = /\.(mp4|mov|mkv|webm|avi)$/i;
      const tasks: Promise<void>[] = [];

      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && VIDEO_EXT.test(relativePath)) {
          tasks.push(
            zipEntry.async("blob").then(blob => {
              const name = relativePath.split("/").pop() ?? relativePath;
              videoFiles.push(new File([blob], name, { type: "video/mp4" }));
            })
          );
        }
      });

      await Promise.all(tasks);

      if (videoFiles.length === 0) {
        setError("No video files found in the ZIP. Make sure it contains .mp4, .mov, .mkv, or .webm files.");
        return;
      }

      // Sort by filename (expects numbered files: 1.mp4, 2.mp4, 01-intro.mp4, etc.)
      videoFiles.sort((a, b) => {
        const numA = parseInt(a.name.match(/^(\d+)/)?.[1] ?? "999");
        const numB = parseInt(b.name.match(/^(\d+)/)?.[1] ?? "999");
        return numA - numB || a.name.localeCompare(b.name);
      });

      // Build video items
      const items: VideoItem[] = videoFiles.map((f, i) => ({
        id: crypto.randomUUID(),
        fileName: f.name,
        title: f.name.replace(/^\d+[-_\s.]?/, "").replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        description: "",
        order: i + 1,
        isFree: i === 0, // First video free by default
        file: f,
      }));

      setVideos(items);
      setStage("preview");
    } catch (e) {
      console.error(e);
      setError("Failed to read ZIP file. Make sure it&apos;s a valid ZIP archive.");
    }
  }, []);

  // ── Drag & Drop ──────────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".zip")) processZip(file);
    else setError("Please drop a .zip file.");
  }, [processZip]);

  // ── Reorder ──────────────────────────────────────────────────────────────────
  const moveVideo = (id: string, dir: -1 | 1) => {
    setVideos(prev => {
      const idx = prev.findIndex(v => v.id === id);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next.map((v, i) => ({ ...v, order: i + 1 }));
    });
  };

  const removeVideo = (id: string) =>
    setVideos(prev => prev.filter(v => v.id !== id).map((v, i) => ({ ...v, order: i + 1 })));

  const updateVideo = (id: string, patch: Partial<VideoItem>) =>
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));

  // ── Upload & Submit ──────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!title || !description || !price || videos.length === 0) {
      setError("Please fill in all course details and ensure at least one video is present.");
      return;
    }
    setStage("submitting");
    setError("");
    const priceNum = parseFloat(price);

    try {
      const total = videos.length;
      let done = 0;
      const uploaded: VideoItem[] = [];

      // Upload each video to Supabase Storage
      for (const v of videos) {
        const path = `courses/draft_${Date.now()}/${v.order}_${v.fileName}`;
        const { error: upErr } = await supabase.storage
          .from("course-videos")
          .upload(path, v.file, { contentType: "video/mp4", upsert: true });

        if (upErr) throw new Error(`Upload failed for ${v.fileName}: ${upErr.message}`);

        const { data: urlData } = supabase.storage.from("course-videos").getPublicUrl(path);
        uploaded.push({ ...v, fileUrl: urlData.publicUrl, uploaded: true });
        done++;
        setUploadProgress(Math.round((done / total) * 100));
      }

      // Save draft then submit
      const draftRes = await fetch("/api/studio/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, price: priceNum,
          videos: uploaded.map(v => ({
            fileName: v.fileName, title: v.title,
            description: v.description, order: v.order,
            isFree: v.isFree, fileUrl: v.fileUrl,
          })),
        }),
      });
      const draftData = await draftRes.json();
      if (!draftRes.ok) throw new Error(draftData.error);

      const submitRes = await fetch(`/api/studio/drafts/${draftData.draft.id}/submit`, {
        method: "POST",
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error);

      setStage("done");
      setTimeout(() => router.push("/studio/courses"), 2500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An error occurred.";
      setError(msg);
      setStage("preview");
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Upload New Course</h1>
        <p className="text-slate-400 mt-1 text-sm">Bundle your video series into a ZIP and upload. You can preview and edit before submitting.</p>
      </div>

      {/* ── Drop Zone ── */}
      {stage === "drop" && (
        <div
          ref={dropRef}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
            dragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : "border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5"
          }`}
        >
          <input
            ref={fileRef} type="file" accept=".zip" className="hidden"
            onChange={e => e.target.files?.[0] && processZip(e.target.files[0])}
          />
          <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 transition-colors ${dragging ? "bg-indigo-500/20" : "bg-white/5"}`}>
            <Upload className={`w-10 h-10 transition-colors ${dragging ? "text-indigo-400" : "text-slate-500"}`} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {dragging ? "Drop your ZIP here" : "Drop your course ZIP file"}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Name your videos numerically (1.mp4, 2.mp4…) to set the episode order automatically.
          </p>
          <div className="inline-flex gap-2 text-xs text-slate-500 bg-white/5 px-4 py-2 rounded-full">
            <span>Supports:</span>
            <span className="text-slate-400">MP4 • MOV • MKV • WebM</span>
          </div>
        </div>
      )}

      {/* ── Preview & Edit ── */}
      {stage === "preview" && (
        <div className="space-y-6">
          {/* Course metadata */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Course Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Course Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Advanced React & Next.js Patterns"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="What will students learn in this course?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="49.99"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Video list */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                {videos.length} Video{videos.length !== 1 && "s"} Detected
              </h2>
              <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                Drag icons or use arrows to reorder
              </span>
            </div>

            <div className="space-y-3">
              {videos.map((v, i) => (
                <div key={v.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 group hover:border-indigo-500/30 transition">
                  <div className="flex items-start gap-3">
                    {/* Order controls */}
                    <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
                      <button onClick={() => moveVideo(v.id, -1)} disabled={i === 0}
                        className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <GripVertical className="w-4 h-4 text-slate-600" />
                      <button onClick={() => moveVideo(v.id, 1)} disabled={i === videos.length - 1}
                        className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <FileVideo className="w-5 h-5 text-indigo-400" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Ep number + filename */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                          EP {v.order}
                        </span>
                        <span className="text-xs text-slate-600 truncate">{v.fileName}</span>
                      </div>

                      {/* Editable title */}
                      <input value={v.title} onChange={e => updateVideo(v.id, { title: e.target.value })}
                        placeholder="Video title"
                        className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-white text-sm py-1 focus:outline-none placeholder-slate-600" />

                      {/* Editable description */}
                      <input value={v.description} onChange={e => updateVideo(v.id, { description: e.target.value })}
                        placeholder="Short description (optional)"
                        className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-slate-400 text-xs py-1 focus:outline-none placeholder-slate-600" />

                      {/* Free toggle */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateVideo(v.id, { isFree: !v.isFree })}
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition ${
                            v.isFree ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-white/5 text-slate-500 border border-white/10"
                          }`}>
                          {v.isFree ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {v.isFree ? "Free Preview" : "Paid"}
                        </button>
                      </div>
                    </div>

                    {/* Delete */}
                    <button onClick={() => removeVideo(v.id)}
                      className="text-slate-600 hover:text-red-400 transition p-1 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStage("drop"); setVideos([]); }}
              className="px-6 py-3 border border-white/10 text-slate-400 hover:text-white hover:border-white/30 rounded-xl transition text-sm font-bold">
              ← Start over
            </button>
            <button onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              <Film className="w-4 h-4" />
              Upload &amp; Submit for Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Uploading ── */}
      {stage === "submitting" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Uploading your course…</h3>
          <p className="text-slate-400 text-sm mb-6">Uploading {videos.length} videos to secure storage</p>
          <div className="max-w-xs mx-auto">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-indigo-400 font-bold text-sm mt-2">{uploadProgress}%</p>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {stage === "done" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Course submitted! 🎉</h3>
          <p className="text-slate-400 text-sm">Your course is now pending admin review. You&apos;ll be notified once it&apos;s approved.</p>
          <p className="text-slate-600 text-xs mt-4">Redirecting to My Courses…</p>
        </div>
      )}
    </div>
  );
}
