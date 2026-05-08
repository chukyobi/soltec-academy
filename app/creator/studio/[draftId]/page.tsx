"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, Save, Trash2, GripVertical, 
  Eye, CheckCircle, AlertCircle, Play, 
  Plus, ArrowLeft, Upload, Edit3, Image as ImageIcon,
  DollarSign, Send, Layout
} from "lucide-react";
import { motion, Reorder } from "framer-motion";

export default function CreatorStudio() {
  const { draftId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const loadDraft = useCallback(async () => {
    try {
      const res = await fetch(`/api/creator/studio/drafts/${draftId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDraft(data.draft);
      setVideos(data.draft.videos || []);
    } catch (e) {
      console.error(e);
      router.push("/creator/dashboard");
    } finally {
      setLoading(false);
    }
  }, [draftId, router]);

  useEffect(() => { loadDraft(); }, [loadDraft]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/creator/studio/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          price: parseFloat(draft.price),
          videos: videos.map((v, i) => ({ ...v, order: i + 1 }))
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Changes saved successfully!");
    } catch (e) {
      alert("Error saving draft");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!draft.title || !draft.description || !draft.price || videos.length === 0) {
      return alert("Please complete all details and add videos before submitting.");
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/creator/studio/drafts/${draftId}/submit`, { method: "POST" });
      if (!res.ok) throw new Error("Submission failed");
      alert("Course submitted for review!");
      router.push("/creator/dashboard");
    } catch (e) {
      alert("Error submitting course");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="fixed inset-0 bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090f] font-sans text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d14]/80 backdrop-blur-md border-b border-white/5 px-12 py-6 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <button onClick={() => router.push("/creator/dashboard")} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black text-white truncate max-w-md">{draft.title || "Untitled Draft"}</h1>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">Draft</span>
               </div>
               <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Soltec Studio &bull; Editing Mode</p>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Progress
            </button>
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
               <Send className="w-4 h-4" /> Submit for Review
            </button>
         </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Left Column - Details */}
         <div className="lg:col-span-2 space-y-12">
            <section className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl">
               <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3 mb-8">
                  <Layout className="w-5 h-5 text-emerald-500" /> Course Architecture
               </h3>

               <div className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Title</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Mastering Next.js Advanced Patterns"
                       className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-xl font-black text-white focus:outline-none focus:border-emerald-500 transition-all"
                       value={draft.title}
                       onChange={(e) => setDraft({...draft, title: e.target.value})}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Compelling Description</label>
                     <textarea 
                       placeholder="Explain why students should buy this course..."
                       rows={6}
                       className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-6 px-8 text-slate-300 leading-relaxed focus:outline-none focus:border-emerald-500 transition-all resize-none"
                       value={draft.description}
                       onChange={(e) => setDraft({...draft, description: e.target.value})}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Price (NGN)</label>
                        <div className="relative group">
                           <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                           <input 
                             type="number" 
                             placeholder="5000"
                             className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-xl font-black text-white focus:outline-none focus:border-emerald-500 transition-all"
                             value={draft.price}
                             onChange={(e) => setDraft({...draft, price: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Thumbnail</label>
                        <button className="w-full bg-white/[0.03] border-2 border-dashed border-white/10 rounded-2xl py-5 px-8 flex items-center justify-center gap-3 text-slate-500 hover:text-white hover:border-emerald-500/50 transition-all">
                           <ImageIcon className="w-5 h-5" /> Select Image
                        </button>
                     </div>
                  </div>
               </div>
            </section>

            <section className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                     <Film className="w-5 h-5 text-emerald-500" /> Video Curriculum
                  </h3>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">{videos.length} Modules Extracted</span>
               </div>

               <Reorder.Group axis="y" values={videos} onReorder={setVideos} className="space-y-4">
                  {videos.map((video) => (
                    <Reorder.Item key={video.id} value={video} className="group flex items-center gap-6 bg-white/[0.02] border border-white/5 rounded-[28px] p-6 hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all cursor-grab active:cursor-grabbing">
                       <div className="flex items-center gap-4 shrink-0">
                          <GripVertical className="w-5 h-5 text-slate-700 group-hover:text-emerald-500/50" />
                          <div className="w-20 aspect-video rounded-xl bg-black flex items-center justify-center text-slate-700 border border-white/5 relative overflow-hidden">
                             <Play className="w-5 h-5 relative z-10" />
                             <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none text-white font-black text-lg focus:outline-none focus:ring-0 p-0"
                            value={video.title}
                            onChange={(e) => setVideos(videos.map(v => v.id === video.id ? {...v, title: e.target.value} : v))}
                          />
                          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">{video.fileName}</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <button className="p-3 text-slate-600 hover:text-emerald-400 transition-colors">
                             <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-3 text-slate-600 hover:text-red-500 transition-colors">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </Reorder.Item>
                  ))}
               </Reorder.Group>

               {videos.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] opacity-40">
                     <Film className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                     <p className="text-slate-500 font-black uppercase tracking-widest">No modules found</p>
                  </div>
               )}
            </section>
         </div>

         {/* Right Column - Status & Tips */}
         <div className="space-y-8">
            <section className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl border-l-4 border-l-amber-500">
               <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Review Checklist
               </h4>
               <ul className="space-y-5">
                  {[
                    { label: "High-quality thumbnail (1920x1080)", done: !!draft.thumbnail },
                    { label: "Clear and descriptive title", done: draft.title?.length > 10 },
                    { label: "Detailed course curriculum", done: videos.length > 0 },
                    { label: "Competitive pricing", done: !!draft.price },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-xs font-medium">
                       <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-slate-700'}`}>
                          {item.done ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                       </div>
                       <span className={item.done ? 'text-slate-300' : 'text-slate-500'}>{item.label}</span>
                    </li>
                  ))}
               </ul>
            </section>

            <section className="bg-emerald-600 rounded-[40px] p-10 shadow-2xl shadow-emerald-600/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl" />
               <h4 className="text-white font-black text-xl mb-4 relative z-10">Creator Tip 💡</h4>
               <p className="text-white/80 text-sm leading-relaxed relative z-10">
                 Courses with descriptive module titles and a clear introduction video sell **4.5x more** than generic ones. 
               </p>
               <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                  <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Current Earning Model</p>
                  <p className="text-white font-black text-2xl mt-1">70% <span className="text-sm font-medium opacity-60 uppercase tracking-widest">Commission</span></p>
               </div>
            </section>
         </div>
      </main>
    </div>
  );
}
