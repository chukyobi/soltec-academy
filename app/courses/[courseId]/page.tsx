import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { 
  PlayCircle, Clock, BookOpen, 
  ShieldCheck, Globe, Star, ArrowLeft,
  CheckCircle2, Lock, Sparkles, User
} from "lucide-react";
import Link from "next/link";
import CoursePurchaseWrapper from "./CoursePurchaseWrapper";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const course = await prisma.creatorCourse.findUnique({
    where: { id: courseId },
    include: {
      creator: {
        include: { creatorProfile: true }
      },
      videos: { orderBy: { order: "asc" } }
    }
  });

  if (!course || course.status !== "APPROVED") redirect("/courses");

  return (
    <div className="min-h-screen bg-[#09090f] text-slate-200 font-sans pb-32">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 border-b border-white/5 bg-[#0d0d14]">
         <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />
         
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
               <Link href="/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Marketplace
               </Link>
               
               <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">High-Impact Course</span>
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-black"><Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9 Rating</span>
               </div>

               <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
                  {course.title}
               </h1>
               
               <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                  {course.description}
               </p>

               <div className="flex flex-wrap items-center gap-8 mb-12">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black overflow-hidden shadow-xl">
                        {course.creator?.image ? <img src={course.creator.image} className="w-full h-full object-cover" /> : (course.creator?.name || "C")[0]}
                     </div>
                     <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Master Instructor</p>
                        <p className="text-white font-black">{course.creator?.name || "Instructor"}</p>
                     </div>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden md:block" />
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <BookOpen className="w-4 h-4 text-indigo-500" /> {course.videos.length} Modules
                     </div>
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Globe className="w-4 h-4 text-emerald-500" /> Life-time Access
                     </div>
                  </div>
               </div>

               <CoursePurchaseWrapper course={course} />
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-600/30 transition-all duration-700" />
               <div className="relative aspect-video bg-[#09090f] rounded-[48px] border-4 border-white/5 overflow-hidden shadow-2xl">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-black flex flex-col items-center justify-center">
                       <PlayCircle className="w-20 h-20 text-white/10 mb-4" />
                       <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs italic">Preview not available</p>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <button className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-all group/play">
                        <PlayCircle className="w-12 h-12 fill-black" />
                     </button>
                  </div>
               </div>
               
               <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[32px] shadow-2xl hidden md:block animate-bounce-slow">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">One-time payment</p>
                  <p className="text-indigo-600 text-3xl font-black">NGN {course.price.toLocaleString()}</p>
               </div>
            </div>
         </div>
      </section>

      {/* Curriculum & Details */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-3 gap-20">
         <div className="lg:col-span-2 space-y-16">
            <div>
               <h3 className="text-3xl font-black text-white tracking-tight mb-8 flex items-center gap-4">
                  <Sparkles className="w-8 h-8 text-indigo-500" /> Course Curriculum
               </h3>
               <div className="space-y-4">
                  {course.videos.map((video, i) => (
                    <div key={video.id} className="group flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 text-xs font-black border border-white/5 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                             {i + 1}
                          </div>
                          <div>
                             <h4 className="text-white font-black text-lg group-hover:text-indigo-400 transition-colors">{video.title}</h4>
                             <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Video Module &bull; {video.isFree ? "Free Preview" : "Paid Only"}</p>
                          </div>
                       </div>
                       {video.isFree ? (
                          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-500/20 transition-all">
                             <PlayCircle className="w-3.5 h-3.5" /> Preview
                          </button>
                       ) : (
                          <Lock className="w-4 h-4 text-slate-800" />
                       )}
                    </div>
                  ))}
               </div>
            </div>

            <div>
               <h3 className="text-3xl font-black text-white tracking-tight mb-8">What you&apos;ll achieve</h3>
               <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    "Master industry-standard best practices",
                    "Build professional-grade projects",
                    "Gain lifetime access to updates",
                    "Certificate of completion"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                       <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                       </div>
                       <p className="text-slate-400 text-sm font-medium leading-relaxed">{item}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-12">
            <div className="bg-[#0d0d14] border border-white/5 rounded-[40px] p-10 shadow-xl">
               <h4 className="text-white font-black text-xl mb-8">The Instructor</h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-[24px] bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-2xl overflow-hidden">
                     {course.creator.image ? <img src={course.creator.image} className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
                  </div>
                  <div>
                     <p className="text-white font-black text-lg">{course.creator.name || "Instructor"}</p>
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{course.creator.creatorProfile?.specialty || "Industry Expert"}</p>
                  </div>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
                  &quot;{course.creator.creatorProfile?.bio || "Dedicated to sharing practical industry knowledge through high-quality digital content."}&quot;
               </p>
               <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-600 font-black uppercase tracking-widest">Total Students</span>
                     <span className="text-white font-black">2.4k+</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-600 font-black uppercase tracking-widest">Experience</span>
                     <span className="text-white font-black">8+ Years</span>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-600 rounded-[40px] p-10 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
               <h4 className="text-white font-black text-2xl mb-4 relative z-10 tracking-tight">Need Team Training?</h4>
               <p className="text-white/80 text-sm leading-relaxed relative z-10 font-medium mb-8">
                  Get bulk licenses for your entire engineering team or organization at a discounted rate.
               </p>
               <button className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl hover:bg-slate-100 transition-all relative z-10 text-xs uppercase tracking-widest">Contact Sales</button>
            </div>
         </div>
      </section>
    </div>
  );
}
