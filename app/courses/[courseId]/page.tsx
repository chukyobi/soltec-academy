"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MOCK_COURSES, isCourseEnrolled, enrollInCourse } from '@/lib/mock-data';
import { PlayCircle, Lock, ClipboardList, ArrowRight, ShieldCheck, Clock, Layers, ChevronDown, ChevronUp, Star, Users, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params?.courseId as string;

  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  const course = MOCK_COURSES.find(c => c.slug === courseSlug);
  
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setEnrolled(isCourseEnrolled(course.id));
      if (course.modules.length > 0) {
        setExpandedModules([course.modules[0].id]);
        if (course.modules[0].videos.length > 0) {
          setActiveVideoId(course.modules[0].videos[0].id);
        }
      }
    }
  }, [course]);

  if (!course) {
    return notFound();
  }

  const allVideos = course.modules.flatMap(m => m.videos);
  const activeVideo = allVideos.find(v => v.id === activeVideoId);

  const isPreviewable = (video: any) => {
    if (enrolled) return true;
    const index = allVideos.findIndex(v => v.id === video.id);
    return index !== -1 && index < course.previewVideosCount;
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  if (!course) {
    return notFound();
  }

  const handleEnroll = () => {
    setLoading(true);
    // Simulate payment / API delay
    setTimeout(() => {
      enrollInCourse(course.id);
      setEnrolled(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />
      
      {/* Course Premium Light Hero */}
      <div className="bg-white text-slate-900 pt-32 pb-24 lg:pt-36 lg:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center min-h-[60vh]">
        {/* Abstract Grid Details */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        
        {/* Burst of colors / Gradients */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/30 via-purple-300/30 to-blue-300/30 rounded-full blur-[100px] -translate-y-1/2 z-0 pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0], opacity: [0.5, 0.7, 0.5] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-red-200/30 rounded-full blur-[120px] translate-y-1/2 z-0 pointer-events-none" 
        />
        
        <div className="max-w-[1200px] mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest backdrop-blur-md text-blue-600 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {course.level} Level
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900">
              {course.title}
            </h1>
            
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-xl font-medium">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full border border-gray-100 shadow-sm backdrop-blur-sm">
                <Image
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover w-12 h-12 shadow-sm"
                />
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Taught By</div>
                  <div className="font-bold text-slate-900 text-sm">{course.instructor.name}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div className="text-xs text-slate-500 font-semibold">4.9 Average Rating</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative lg:h-[450px] flex items-center justify-center -mt-6 lg:mt-0"
          >
            <div className="absolute inset-0 bg-blue-500/10 rounded-[40px] rotate-3 blur-2xl transform-gpu" />
            <div className="relative w-full aspect-[4/3] lg:h-full lg:w-auto rounded-[32px] overflow-hidden border border-gray-100 bg-white backdrop-blur-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl">
               <Image
                 src={course.thumbnail}
                 alt={course.title}
                 fill
                 className="object-cover opacity-[0.03] pointer-events-none"
               />
               <div className="relative z-10 flex flex-col items-center space-y-6">
                 <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center border border-gray-100 shadow-xl mb-4">
                   <ShieldCheck className="w-12 h-12 text-blue-500" />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight text-slate-800">Become a master in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{course.title}</span></h3>
                 <p className="text-slate-500 max-w-xs font-medium">Join this immersive, high-impact curriculum directly to catapult your professional career.</p>
               </div>
            </div>
          </motion.div>
          
        </div>
      </div>

      <div className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Course Content */}
          <div className="lg:col-span-8 space-y-12">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-8">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
                    <span className="text-gray-600 font-medium">Industry standard best practices and advanced techniques.</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Course Syllabus</h2>
                <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{course.modules.length} Modules</div>
              </div>
              
              <div className="space-y-4">
                {course.modules.map((module, i) => (
                  <div key={module.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button 
                      onClick={() => toggleModule(module.id)} 
                      className="w-full p-6 bg-gray-50/50 hover:bg-gray-100/50 transition-colors border-b border-gray-100 flex justify-between items-center text-left"
                    >
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm shrink-0">
                          {i + 1}
                        </span>
                        {module.title}
                      </h3>
                      {expandedModules.includes(module.id) ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    
                    {expandedModules.includes(module.id) && (
                      <div className="p-0 border-t border-gray-100 bg-slate-50/30">
                        {module.videos.map((video) => {
                          const previewable = isPreviewable(video);
                          const isActive = activeVideoId === video.id;
                          return (
                          <div key={video.id} className="flex flex-col border-b border-gray-100 last:border-0">
                            <div 
                              onClick={() => previewable && setActiveVideoId(video.id)}
                              className={`group flex items-start justify-between p-5 transition-colors ${previewable ? 'hover:bg-blue-50/40 cursor-pointer' : 'opacity-70'} ${isActive ? 'bg-blue-50/50' : ''}`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="mt-0.5">
                                  {video.isAssessment ? (
                                    <ClipboardList className={`w-5 h-5 shrink-0 ${previewable ? 'text-purple-500' : 'text-gray-400'} ${isActive ? 'text-purple-600' : ''}`} />
                                  ) : previewable ? (
                                    <PlayCircle className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-blue-600 fill-blue-100 scale-110' : 'text-blue-500 group-hover:scale-110'}`} />
                                  ) : (
                                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                                  )}
                                </div>
                                <div>
                                  <div className={`font-semibold text-[15px] ${isActive ? 'text-blue-900' : 'text-slate-700 group-hover:text-blue-900'}`}>
                                    {video.title}
                                    {previewable && !enrolled && !video.isAssessment && (
                                       <span className="ml-3 text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-block align-middle mb-0.5 border border-purple-200">
                                         Preview
                                       </span>
                                    )}
                                  </div>
                                  {video.description && (
                                    <div className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
                                      {video.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 shrink-0 ml-4 mt-1 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                <Clock className="w-3.5 h-3.5" />
                                {video.duration}
                              </div>
                            </div>
                            
                            {/* Inline Preview Player */}
                            <AnimatePresence>
                              {isActive && previewable && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }} 
                                  animate={{ height: 'auto', opacity: 1 }} 
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-slate-900"
                                >
                                  {video.isAssessment ? (
                                    <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center">
                                       <ClipboardList className="w-12 h-12 text-purple-400 mb-4" />
                                       <h4 className="text-xl font-bold text-white mb-2">Ready for the assessment?</h4>
                                       <p className="text-slate-400 text-sm max-w-sm mb-6">Completing this validates your knowledge so far.</p>
                                       {enrolled ? (
                                         <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-colors cursor-pointer">Start Assessment</button>
                                       ) : (
                                         <div className="text-sm px-4 py-2 bg-white/10 text-white rounded-full border border-white/20">Enroll to unlock assessment</div>
                                       )}
                                    </div>
                                  ) : (
                                    <div className="w-full aspect-video flex items-center justify-center relative shadow-inner">
                                       {/* Simulated Video UI */}
                                       <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-black"></div>
                                       <Image src={course.thumbnail} alt={video.title} fill className="object-cover opacity-20 mix-blend-luminosity" />
                                       
                                       <div className="w-16 h-16 bg-white/20 flex items-center justify-center rounded-full backdrop-blur-md cursor-pointer hover:scale-110 hover:bg-white/30 transition-all z-10 border border-white/30">
                                         <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                                       </div>
                                       
                                       <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-between z-10">
                                         <div className="text-white text-sm font-semibold tracking-wide flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            {video.title}
                                         </div>
                                         <div className="text-xs text-white/70 font-mono bg-black/50 px-2 py-1 rounded backdrop-blur-sm">00:00 / {video.duration}</div>
                                       </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )})}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Enrollment Sticky Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-2xl shadow-blue-900/5 border border-gray-100">
              <div className="text-3xl font-black text-slate-900 mb-6">
                ${course.price}
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-600 font-medium">
                   <Clock className="w-5 h-5 text-gray-400" />
                   {course.duration} of on-demand video
                </div>
                <div className="flex items-center gap-3 text-gray-600 font-medium">
                   <Layers className="w-5 h-5 text-gray-400" />
                   {course.modules.length} comprehensive modules
                </div>
                <div className="flex items-center gap-3 text-gray-600 font-medium">
                   <ClipboardList className="w-5 h-5 text-gray-400" />
                   Assignments & Q&A Access
                </div>
              </div>

              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Enroll Now</>
                  )}
                </button>
              ) : (
                <Link
                  href={`/classroom/${course.id}`}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  Enter the Classroom <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              
              <p className="text-center text-xs text-gray-400 font-medium mt-4">
                30-Day Money-Back Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* More Courses Section */}
      <div className="bg-slate-50 border-t border-gray-100 py-24">
         <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">More Courses Like This</h2>
            <p className="text-slate-500 mb-10">Expand your skillset with our other highly rated courses.</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {MOCK_COURSES.filter(c => c.id !== course.id).slice(0, 16).map(c => (
                 <Link 
                   href={`/courses/${c.slug}`}
                   key={c.id}
                   className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col"
                 >
                    <div className="relative h-32 sm:h-40 overflow-hidden shrink-0">
                      <Image 
                        src={c.thumbnail} 
                        alt={c.title} 
                        fill 
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold uppercase text-slate-900 shadow-sm">
                         {c.level}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                       <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{c.title}</h4>
                       <div className="flex items-center gap-2 mb-4">
                         <Image src={c.instructor.avatar} alt="avatar" width={16} height={16} className="rounded-full" loading="lazy" />
                         <span className="text-[10px] uppercase font-bold text-slate-400">{c.instructor.name}</span>
                       </div>
                       <div className="mt-auto border-t border-gray-50 pt-3 flex items-center justify-between">
                         <span className="text-xs font-semibold text-slate-500"><Clock className="w-3 h-3 inline mr-1" />{c.duration}</span>
                         <span className="font-black text-sm text-slate-900">{c.price}</span>
                       </div>
                    </div>
                 </Link>
              ))}
            </div>
         </div>
      </div>
      
      <Footer />
    </main>
  );
}
