"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MOCK_COURSES } from '@/lib/mock-data';
import { Clock, BookOpen, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ["All", "Data", "Design", "Frontend", "Backend"];

export default function CoursesCatalog() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                          course.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || course.title.toLowerCase().includes(activeTab.toLowerCase());
    return matchesSearch && matchesTab;
  });

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />
      
      {/* Premium Light Hero Section */}
      <div className="bg-white text-slate-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[60vh] flex flex-col items-center justify-center">
        {/* Abstract Grid Details */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        
        {/* Burst of colors / Gradients */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/30 via-purple-300/30 to-blue-300/30 rounded-full blur-[100px] -translate-y-1/2 z-0" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0], opacity: [0.5, 0.7, 0.5] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-red-200/30 rounded-full blur-[120px] translate-y-1/2 z-0" 
        />

        {/* Floating Icons */}
        <motion.div 
          animate={{ y: [-15, 15, -15], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[15%] hidden lg:flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl border border-gray-100 z-10"
        >
          <BookOpen className="w-8 h-8 text-blue-500" />
        </motion.div>
        <motion.div 
          animate={{ y: [15, -15, 15], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-[15%] hidden lg:flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl border border-gray-100 z-10"
        >
          <TrendingUp className="w-10 h-10 text-emerald-500" />
        </motion.div>
        
        <div className="max-w-[1000px] mx-auto relative z-10 flex flex-col items-center text-center w-full mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-widest text-blue-600 mb-8">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               Soltec Academy Catalog
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-slate-900 leading-[1.05]"
          >
            Master The Skills <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Of Tomorrow</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-2xl"
          >
            Explore our curated catalog of elite courses designed by industry experts. Accelerate your career with real-world projects.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative w-full max-w-2xl group"
          >
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl transition-opacity duration-500" />
            <div className="relative flex items-center bg-white border border-gray-200 shadow-xl rounded-full p-2">
              <Search className="w-6 h-6 text-slate-400 ml-4 shrink-0" />
              <input 
                type="text" 
                placeholder="What do you want to learn today?" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 py-3 sm:py-4 px-4 focus:outline-none focus:ring-0 text-base sm:text-lg"
              />
              <button className="hidden sm:block bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-600 transition-colors shrink-0">
                 Search
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Courses</h2>
              <p className="text-gray-500">Join thousands of students learning in-demand skills.</p>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto mt-6 md:mt-0 hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors text-sm ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCourses.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="col-span-full py-24 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm"
                >
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses found</h3>
                  <p className="text-lg">Try adjusting your search query or selecting a different category.</p>
                </motion.div>
              ) : null}
              {filteredCourses.map((course, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: index % 6 * 0.05 }}
                  key={course.id}
                >
                  <Link 
                    href={`/courses/${course.slug}`}
                    className="group relative bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                      
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-lg flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                         {course.level}
                      </div>

                      <div className="absolute bottom-4 left-4 flex gap-2">
                        {course.isProgramming && (
                          <div className="bg-white/20 backdrop-blur-md border border-white/20 p-1.5 rounded-lg text-white">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow relative bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2.5">
                          <Image
                            src={course.instructor.avatar}
                            alt={course.instructor.name}
                            width={32}
                            height={32}
                            loading="lazy"
                            className="rounded-full object-cover shadow-sm border border-gray-100"
                          />
                          <div className="text-sm font-semibold text-slate-800">
                            {course.instructor.name}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-[1.2] mb-3 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <div className="flex items-center text-slate-500 text-xs font-semibold gap-3 mb-6 mt-auto">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          {course.modules.length} Mods
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest line-through">¥15k</span>
                        <span className="text-xl font-black text-slate-900">
                          {course.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
