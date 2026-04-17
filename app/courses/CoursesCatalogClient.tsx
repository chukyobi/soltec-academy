"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ["All", "Data", "Design", "Frontend", "Backend"];

// These types mirror the AcademyCourse DB shape
export interface AcademyCourseCard {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  level: string;
  duration: string;
  price: string;
  isProgramming: boolean;
  instructorName: string | null;
  instructorAvatar: string | null;
  // modules is JSON — we just need the length
  modules: { id: string; title: string; videos: unknown[] }[] | null;
}

interface Props {
  courses: AcademyCourseCard[];
}

export default function CoursesCatalogClient({ courses }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "All" || c.title.toLowerCase().includes(activeTab.toLowerCase());
    return matchesSearch && matchesTab;
  });

  return (
    <>
      {/* Search + Tabs hero is rendered server-side in page.tsx — this handles interactive part */}
      <div className="relative w-full max-w-2xl group mx-auto">
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
      </div>

      {/* Grid section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Courses</h2>
              <p className="text-gray-500">Join thousands of students learning in-demand skills.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto mt-6 md:mt-0 hide-scrollbar">
              {TABS.map((tab) => (
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
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="col-span-full py-24 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm"
                >
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses found</h3>
                  <p className="text-lg">Try adjusting your search or selecting a different category.</p>
                </motion.div>
              ) : null}

              {filtered.map((course, index) => (
                <motion.div
                  layout
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
                >
                  <Link
                    href={`/courses/${course.slug}`}
                    className="group relative bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-lg flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {course.level}
                      </div>
                      {course.isProgramming && (
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-white/20 backdrop-blur-md border border-white/20 p-1.5 rounded-lg text-white">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow relative bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2.5">
                          {course.instructorAvatar ? (
                            <Image
                              src={course.instructorAvatar}
                              alt={course.instructorName ?? "Instructor"}
                              width={32}
                              height={32}
                              loading="lazy"
                              className="rounded-full object-cover shadow-sm border border-gray-100"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {(course.instructorName ?? "S")[0]}
                            </div>
                          )}
                          <div className="text-sm font-semibold text-slate-800">
                            {course.instructorName ?? "Soltec Instructor"}
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
                          {course.modules?.length ?? 0} Mods
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest line-through">NGN15k</span>
                        <span className="text-xl font-black text-slate-900">{course.price}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
