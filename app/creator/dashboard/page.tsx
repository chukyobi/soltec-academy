"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, LayoutDashboard, Film, BarChart3, 
  Settings, Loader2, PlayCircle, Clock, 
  DollarSign, Users, ArrowUpRight, PlusCircle,
  FileZip, Search, Bell
} from "lucide-react";
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";

export default function CreatorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const pRes = await fetch("/api/creator/profile");
        const pData = await pRes.json();
        
        if (pRes.status === 401) return router.push("/creator/login");
        if (!pData.profile || pData.profile.approvalStatus === "PENDING") {
          return router.push("/creator/onboarding");
        }
        setProfile(pData.profile);

        const dRes = await fetch("/api/creator/studio/drafts");
        const dData = await dRes.json();
        setDrafts(dData.drafts || []);

        const cRes = await fetch("/api/creator/studio/published");
        const cData = await cRes.json();
        setPublished(cData.courses || []);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleZipUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!zipFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", zipFile);
      formData.append("title", courseTitle);

      const res = await fetch("/api/creator/studio/upload-zip", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.push(`/creator/studio/${data.draftId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return (
    <div className="fixed inset-0 bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090f] font-sans text-slate-200">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#0d0d14] border-r border-white/5 p-8 flex flex-col z-50">
        <div className="mb-12">
          <img src="/soltec-academy-logo.svg" className="h-8 brightness-0 invert" />
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true },
            { icon: Film, label: "My Studio", active: false },
            { icon: BarChart3, label: "Sales & Analytics", active: false },
            { icon: Settings, label: "Settings", active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${item.active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5">
           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Creator Status</p>
              <p className="text-white font-black text-sm uppercase tracking-tight">{profile?.approvalStatus}</p>
              <div className="mt-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Live on Network</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-12 max-w-7xl">
        <header className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Creator Studio</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Manage your digital products and monitor performance.</p>
          </div>
          <div className="flex items-center gap-6">
             <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Bell className="w-5 h-5" />
             </button>
             <UserMenu user={{ name: "Creator", email: "creator@soltec.com" }} role="creator" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Revenue", val: "$0.00", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total Students", val: "0", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Active Courses", val: published.length.toString(), icon: PlayCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0d14] border border-white/5 rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-700" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-white">{stat.val}</h3>
            </div>
          ))}
        </div>

        {/* Courses Section */}
        <div className="space-y-12">
          {/* Drafts */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                 <Clock className="w-5 h-5 text-emerald-500" /> Drafts in Progress
               </h3>
               <button 
                 onClick={() => setShowUploadModal(true)}
                 className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/10 active:scale-95"
               >
                 <PlusCircle className="w-4 h-4" /> Create New Course
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.length > 0 ? drafts.map((draft) => (
                <Link key={draft.id} href={`/creator/studio/${draft.id}`} className="group bg-[#0d0d14] border border-white/5 rounded-[32px] overflow-hidden hover:border-emerald-500/30 transition-all shadow-xl">
                   <div className="aspect-video bg-white/5 relative">
                      {draft.thumbnail ? <img src={draft.thumbnail} className="w-full h-full object-cover" /> : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                           <FileZip className="w-12 h-12 text-slate-700 mb-4 group-hover:text-emerald-500/50 transition-colors" />
                           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">In Editing Phase</p>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400">
                        Draft
                      </div>
                   </div>
                   <div className="p-8">
                      <h4 className="text-white font-black text-lg group-hover:text-emerald-400 transition-colors truncate">{draft.title}</h4>
                      <p className="text-slate-500 text-xs mt-2 font-medium line-clamp-2">{draft.description || "No description provided yet."}</p>
                      <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/5">
                         <span className="text-slate-700 text-[10px] font-black uppercase tracking-widest">Updated 2h ago</span>
                         <span className="text-white text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-2">Edit Draft <ArrowUpRight className="w-4 h-4" /></span>
                      </div>
                   </div>
                </Link>
              )) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] opacity-40">
                   <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center mb-6">
                      <Film className="w-10 h-10 text-slate-500" />
                   </div>
                   <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm">No drafts available</p>
                   <p className="text-slate-700 text-xs mt-2 font-medium">Click &quot;Create New Course&quot; to start uploading.</p>
                </div>
              )}
            </div>
          </section>

          {/* Published */}
          <section>
            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3 mb-8">
              <PlayCircle className="w-5 h-5 text-blue-500" /> Published Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {published.length === 0 && (
                 <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] opacity-40">
                    <BarChart3 className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-xs">No active courses yet</p>
                 </div>
               )}
            </div>
          </section>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-[#0d0d14] border border-white/10 w-full max-w-xl rounded-[40px] p-10 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
              <button onClick={() => setShowUploadModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">✕</button>
              
              <div className="text-center mb-10">
                 <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <FileZip className="w-8 h-8 text-emerald-400" />
                 </div>
                 <h3 className="text-3xl font-black text-white tracking-tight">Bulk Video Upload</h3>
                 <p className="text-slate-500 text-sm mt-2 font-medium">Upload a ZIP file containing your course videos. We&apos;ll extract them and create your draft automatically.</p>
              </div>

              <form onSubmit={handleZipUpload} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Mastering Next.js Advanced Patterns"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Package File (.zip)</label>
                    <div className="relative">
                       <input 
                         required
                         type="file" 
                         accept=".zip"
                         onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                         className="hidden" 
                         id="zip-upload"
                       />
                       <label htmlFor="zip-upload" className="w-full bg-white/[0.03] border-2 border-dashed border-white/10 rounded-2xl py-8 px-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all group">
                          <Plus className="w-8 h-8 text-slate-700 group-hover:text-emerald-400 mb-2 transition-colors" />
                          <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{zipFile ? zipFile.name : "Select ZIP Package"}</span>
                       </label>
                    </div>
                 </div>

                 <button 
                   disabled={uploading || !zipFile || !courseTitle}
                   className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
                 >
                   {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Start Upload & Extraction <ArrowRight className="w-5 h-5" /></>}
                 </button>
              </form>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4">
                 <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                 <p className="text-amber-500/80 text-[11px] leading-relaxed font-medium uppercase tracking-wider">
                   Ensure videos are in .mp4 or .mov format and named appropriately. The order in the zip will determine the initial course sequence.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
