"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { MOCK_COURSES, isCourseEnrolled } from '@/lib/mock-data';
import { PlayCircle, CheckCircle2, Circle, MessageSquare, FileText, ChevronLeft, Send, Paperclip, ClipboardList, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

export default function Classroom() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState(MOCK_COURSES.find(c => c.id === courseId));
  const [activeTab, setActiveTab] = useState<'video' | 'assignments' | 'qa'>('video');
  const [activeVideo, setActiveVideo] = useState(course?.modules[0]?.videos[0]?.id);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Authentication check simulation
  useEffect(() => {
    if (course && !isCourseEnrolled(course.id)) {
      router.push(`/courses/${course.slug}`);
    }
  }, [course, router]);

  if (!course) {
    return notFound();
  }

  const currentVideo = course.modules.flatMap(m => m.videos).find(v => v.id === activeVideo) || course.modules[0].videos[0];

  return (
    <div className={`${theme} min-h-screen w-full relative`}><div className="bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 flex flex-col min-h-screen transition-colors duration-300">
      {/* Classroom Header */}
      <header className="h-16 border-b border-neutral-800 bg-white dark:bg-neutral-950 flex items-center px-4 justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/courses" className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-gray-100 dark:bg-neutral-800"></div>
          <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent truncate max-w-xs sm:max-w-md">
            {course.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          
          {mounted && (
            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shadow-sm ml-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>
          )}
          <div className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-widest hidden sm:block">

            Student Portal
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
            YOU
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-neutral-950 flex flex-col relative">
          {/* Main Viewer Area */}
          {currentVideo.isAssessment ? (
            <div className={`w-full ${course.isProgramming ? 'flex-1 min-h-[500px]' : 'aspect-video'} relative bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex flex-col`}>
               {course.isProgramming ? (
                 <div className="flex-1 flex flex-col sm:flex-row h-full">
                    {/* Instructions */}
                    <div className="w-full sm:w-1/3 p-6 border-r border-gray-200 dark:border-neutral-800 overflow-y-auto">
                       <h3 className="font-bold text-lg mb-2">Instructions</h3>
                       <p className="text-slate-600 dark:text-neutral-400 text-sm mb-6">{currentVideo.description || 'Solve the programming challenge.'}</p>
                       <div className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Example:</h4>
                          <code className="text-xs text-blue-400">console.log("Hello World");</code>
                       </div>
                    </div>
                    {/* Code Editor */}
                    <div className="w-full sm:w-2/3 flex flex-col bg-[#1e1e1e]">
                       <div className="h-10 border-b border-gray-200 dark:border-neutral-800 bg-[#2d2d2d] flex items-center px-4 justify-between shrink-0">
                         <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                         </div>
                         <div className="text-xs text-slate-600 dark:text-neutral-400 font-mono">index.js</div>
                         <button className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs px-3 py-1 rounded font-medium flex items-center gap-1 shadow-md transition-colors">
                            <PlayCircle className="w-3 h-3" /> Run Code
                         </button>
                       </div>
                       <textarea 
                         className="flex-1 p-4 bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
                         defaultValue={`// Write your code here based on the instructions\n\nfunction main() {\n  \n}\n\nmain();`}
                         spellCheck={false}
                       />
                       <div className="h-48 border-t border-gray-200 dark:border-neutral-800 bg-[#1e1e1e] p-4 font-mono text-xs text-slate-600 dark:text-neutral-400 overflow-y-auto shrink-0 flex flex-col">
                         <div className="mb-2 uppercase text-[10px] font-bold tracking-widest text-slate-500 dark:text-neutral-500">Console Output</div>
                         <div className="flex-1">&gt; _</div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                    <ClipboardList className="w-16 h-16 text-purple-400 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{currentVideo.title}</h3>
                    <p className="text-slate-600 dark:text-neutral-400 mb-6 max-w-md">{currentVideo.description || 'Complete this assessment to continue your learning.'}</p>
                    <button className="bg-purple-600 px-8 py-3 rounded-full font-bold hover:bg-purple-500 transition-colors shadow-lg text-slate-900 dark:text-white">
                      Start Assessment
                    </button>
                    <button className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition-colors">Skip for now</button>
                 </div>
               )}
            </div>
          ) : (
            <div className="aspect-video bg-black w-full relative group border-b border-gray-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
               <div className="absolute inset-0 bg-gray-50 dark:bg-neutral-900 animate-pulse opacity-50"></div>
               <PlayCircle className="w-20 h-20 text-neutral-600 z-10 opacity-50 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-300 cursor-pointer" />
               <div className="absolute bottom-4 left-4 z-10">
                 <div className="bg-slate-100 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-sm font-medium border border-white/10">
                   Pre-recorded Session: {currentVideo.title}
                 </div>
               </div>
            </div>
          )}
          
          {/* Tabs Navigation */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-200 dark:border-neutral-800">
             <h2 className="text-2xl font-black tracking-tight mb-6">{currentVideo.title}</h2>
             <div className="flex gap-8">
               <button 
                onClick={() => setActiveTab('video')}
                className={`pb-4 text-sm font-bold tracking-wider uppercase transition-colors relative ${activeTab === 'video' ? 'text-white' : 'text-neutral-500 hover:text-slate-700 dark:text-neutral-300'}`}
               >
                 Overview
                 {activeTab === 'video' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>}
               </button>
               <button 
                onClick={() => setActiveTab('assignments')}
                className={`pb-4 text-sm font-bold tracking-wider uppercase transition-colors relative ${activeTab === 'assignments' ? 'text-white' : 'text-neutral-500 hover:text-slate-700 dark:text-neutral-300'}`}
               >
                 Assignments
                 {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>}
               </button>
               <button 
                onClick={() => setActiveTab('qa')}
                className={`pb-4 text-sm font-bold tracking-wider uppercase transition-colors relative ${activeTab === 'qa' ? 'text-white' : 'text-neutral-500 hover:text-slate-700 dark:text-neutral-300'}`}
               >
                 Q&A
                 {activeTab === 'qa' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>}
               </button>
             </div>
          </div>

          {/* Tab Content */}
          <div className="p-8 flex-1">
            {activeTab === 'video' && (
              <div className="prose prose-invert max-w-3xl">
                <h3>About this lesson</h3>
                <p className="text-slate-600 dark:text-neutral-400">
                  {currentVideo.description || `In this lesson, ${course.instructor.name} explains the core fundamentals required to master ${currentVideo.title}. Make sure to take notes and complete the assignments attached to this module before proceeding.`}
                </p>
                
                <div className="mt-8 p-6 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={course.instructor.avatar} alt="Instructor" className="w-12 h-12 rounded-full ring-2 ring-neutral-800" />
                    <div>
                      <div className="font-bold">{course.instructor.name}</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-500">{course.instructor.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="max-w-4xl space-y-6">
                {course.assignments && course.assignments.length > 0 ? (
                  course.assignments.map(assignment => (
                    <div key={assignment.id} className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-bold">{assignment.title}</h3>
                             <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                               Due {assignment.dueDate}
                             </span>
                          </div>
                          <p className="text-slate-600 dark:text-neutral-400 text-sm">{assignment.description}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-xl border border-gray-300 dark:border-neutral-700">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-800">
                         <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-500 mb-4">Your Submission</h4>
                         <div className="flex gap-4">
                           <button className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:bg-neutral-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors border border-gray-300 dark:border-neutral-700 text-sm">
                             <Paperclip className="w-4 h-4" />
                             Upload File
                           </button>
                           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-blue-500/20">
                             Submit Assignment
                           </button>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 px-4 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl border border-gray-200 dark:border-neutral-800/50 border-dashed">
                    <CheckCircle2 className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-neutral-300">No Assignments Yet</h3>
                    <p className="text-slate-500 dark:text-neutral-500 mt-2">You're all caught up! Continue watching the lectures.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="max-w-4xl flex flex-col h-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden min-h-[400px]">
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Sample Q&A thread */}
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 text-indigo-400 font-bold text-sm">JD</div>
                     <div>
                       <div className="flex items-baseline gap-2 mb-1">
                         <span className="font-bold text-sm">John Doe</span>
                         <span className="text-xs text-slate-500 dark:text-neutral-500">2 days ago</span>
                       </div>
                       <p className="text-sm text-neutral-300 bg-gray-100 dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-none border border-gray-300 dark:border-neutral-700">
                         I'm confused about the implementation of Server Actions. Do they entirely replace API routes?
                       </p>
                     </div>
                  </div>
                  
                  <div className="flex gap-4 ml-12 mt-4">
                     <img src={course.instructor.avatar} alt="Instructor" className="w-10 h-10 rounded-full shrink-0 ring-2 ring-emerald-500/30" />
                     <div>
                       <div className="flex items-baseline gap-2 mb-1">
                         <span className="font-bold text-sm text-emerald-400">{course.instructor.name} (Instructor)</span>
                         <span className="text-xs text-slate-500 dark:text-neutral-500">1 day ago</span>
                       </div>
                       <p className="text-sm text-neutral-300 bg-gray-100 dark:bg-neutral-800/80 p-4 rounded-2xl rounded-tl-none border border-gray-300 dark:border-neutral-700/80">
                         Great question, John! While they don't replace API routes completely (you still need them for public APIs or webhooks), they do replace the need to write API routes solely for your own frontend mutations.
                       </p>
                     </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask a question..." 
                      className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-neutral-500 rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-slate-900 dark:text-white transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Right Sidebar - Module List */}
        <aside className="w-[380px] border-l border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col shrink-0 overflow-y-auto hidden lg:flex">
          <div className="p-6 border-b border-neutral-800 sticky top-0 bg-white dark:bg-neutral-950 z-10">
            <h2 className="font-bold tracking-tight mb-2">Course Contents</h2>
            <div className="w-full bg-gray-50 dark:bg-neutral-900 rounded-full h-1.5 mb-2 overflow-hidden">
               <div className="bg-blue-500 h-full w-[15%]"></div>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-widest text-right">15% Complete</div>
          </div>
          
          <div className="p-4 space-y-4">
            {course.modules.map((module, i) => (
              <div key={module.id} className="bg-gray-50 dark:bg-neutral-900 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800">
                <div className="px-4 py-3 bg-gray-100 dark:bg-neutral-800/50 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center text-sm font-bold">
                  <span>Module {i + 1}</span>
                </div>
                <div>
                  {module.videos.map(video => (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideo(video.id)}
                      className={`w-full text-left px-4 py-3 flex gap-3 text-sm transition-colors border-l-2 ${
                        activeVideo === video.id 
                          ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                          : 'border-transparent hover:bg-gray-100 dark:bg-neutral-800/80 text-neutral-400 hover:text-slate-800 dark:text-neutral-200'
                      }`}
                    >
                      {video.isAssessment ? (
                        <ClipboardList className={`w-4 h-4 shrink-0 mt-0.5 ${activeVideo === video.id ? 'text-blue-500' : ''}`} />
                      ) : (
                        <Circle className={`w-4 h-4 shrink-0 mt-0.5 ${activeVideo === video.id ? 'fill-blue-500/20 text-blue-500' : ''}`} />
                      )}
                      <div>
                        <div className="font-medium mb-1 leading-tight">{video.title}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex gap-2">
                           <span>{video.isAssessment ? 'Assessment' : video.duration}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
        
      </div>
    </div>\n</div>
  );
}
