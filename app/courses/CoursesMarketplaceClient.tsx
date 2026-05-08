"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, Filter, BookOpen, Clock, 
  Star, ArrowRight, PlayCircle,
  Tag, Layers, Sparkles, Zap
} from "lucide-react";
import { FiZap } from "react-icons/fi";

interface Props {
  initialCourses: any[];
}

export default function CoursesMarketplaceClient({ initialCourses }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = initialCourses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans">
      {/* Aesthetic Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-[#09090f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-600/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            style={{ animation: 'fadeIn 0.8s ease-out forwards' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Self-Paced Mastery Studio
            <FiZap className="w-3.5 h-3.5" />
          </div>

          <h1
            className="text-6xl md:text-8xl font-black text-white leading-[1.0] tracking-tight mb-8"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.1s both' }}
          >
            Learn at your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              own pace.
            </span>
          </h1>

          <p
            className="text-slate-400 text-xl font-medium leading-relaxed mb-12 max-w-2xl mx-auto"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
          >
            High-impact digital courses created by industry veterans. Buy once, own forever, and master the skills that actually matter in the modern economy.
          </p>

          <div 
            className="max-w-2xl mx-auto relative group"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.35s both' }}
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="What do you want to master today?"
              className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-6 pl-16 pr-8 text-white text-lg focus:outline-none focus:border-indigo-500 transition-all shadow-2xl backdrop-blur-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Floating background elements (optional, can add badges here like in AcademyHero) */}
      </section>

      {/* Courses Grid Section */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
            <div>
               <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Marketplace</p>
               <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                  Available <span className="text-indigo-600">Courses</span>
               </h2>
            </div>
            <div className="flex items-center gap-4">
               <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all">
                  <Filter className="w-3.5 h-3.5" /> Filter Tracks
               </button>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="group relative bg-[#09090f] rounded-[40px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-xl flex flex-col min-h-[480px]">
                  <div className="aspect-video relative overflow-hidden">
                     {course.thumbnail ? (
                       <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     ) : (
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-white/20" />
                       </div>
                     )}
                     <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" /> {course.price > 0 ? `NGN ${course.price.toLocaleString()}` : "Free"}
                     </div>
                  </div>
                  
                  <div className="p-10 flex-1 flex flex-col">
                     <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[10px] font-black border border-indigo-500/20">
                           {course.creator?.user?.name?.[0] || "I"}
                        </div>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{course.creator?.user?.name || "Instructor"}</span>
                     </div>
                     <h3 className="text-white font-black text-2xl leading-tight group-hover:text-indigo-400 transition-colors mb-4 line-clamp-2">{course.title}</h3>
                     <p className="text-slate-400 text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
                        {course.description}
                     </p>
                     
                     <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                              <BookOpen className="w-4 h-4 text-indigo-500" /> {course._count?.videos || 0} Modules
                           </div>
                        </div>
                        <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                           Enroll Now <ArrowRight className="w-4 h-4" />
                        </span>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[60px] relative overflow-hidden bg-slate-50">
               <div className="w-32 h-32 rounded-[48px] bg-indigo-600/5 border border-indigo-500/10 flex items-center justify-center mb-10">
                  <Search className="w-16 h-16 text-slate-300" />
               </div>
               <h3 className="text-4xl font-black text-slate-900 mb-4">No results found</h3>
               <p className="text-slate-500 text-lg max-w-md mx-auto text-center font-medium">
                  We couldn&apos;t find any courses matching &quot;{searchTerm}&quot;. Try different keywords.
               </p>
               <button 
                 onClick={() => setSearchTerm("")}
                 className="mt-12 px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20"
               >
                 Browse All Courses
               </button>
            </div>
          )}
        </div>
      </section>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
