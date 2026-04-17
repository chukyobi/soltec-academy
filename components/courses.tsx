'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Layers, BarChart2, Code2, Database, MonitorSmartphone, GraduationCap, Clock } from 'lucide-react';

interface AcademyCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  price: string;
  duration: string;
  slug: string;
  color: string | null;
}

interface Props {
  courses: AcademyCourse[];
}

const SLUG_ICONS: Record<string, React.ElementType> = {
  'product-design': Layers,
  'ui-ux-design': MonitorSmartphone,
  'data-analysis': BarChart2,
  'frontend-web-dev': Code2,
  'backend-web-dev': Database,
};

const SLUG_EMOJIS: Record<string, string> = {
  'product-design': '🎨',
  'ui-ux-design': '✨',
  'data-analysis': '📊',
  'frontend-web-dev': '💻',
  'backend-web-dev': '⚙️',
};

export function Courses({ courses }: Props) {
  const [current, setCurrent] = useState(0);
  const CARDS_VISIBLE = 3;
  const maxIndex = Math.max(0, courses.length - CARDS_VISIBLE);

  const next = () => setCurrent((p) => Math.min(p + 1, maxIndex));
  const prev = () => setCurrent((p) => Math.max(p - 1, 0));

  if (courses.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-3">Academy Tracks</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Explore our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> skill tracks</span>
            </h2>
            <p className="text-slate-500 mt-3 text-base max-w-lg">
              Structured 3-month cohorts with live sessions, a real tutor, and a certificate — not just video courses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={current === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              disabled={current >= maxIndex}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              href="/academy"
              className="ml-2 flex items-center gap-1.5 text-indigo-600 font-bold text-sm hover:gap-2.5 transition-all"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Cards carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-5 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(calc(-${current} * (100% / ${Math.min(courses.length, CARDS_VISIBLE)} + 20px / ${Math.min(courses.length, CARDS_VISIBLE)})))` }}
          >
            {courses.map((course) => {
              const Icon = SLUG_ICONS[course.slug] ?? GraduationCap;
              const emoji = SLUG_EMOJIS[course.slug] ?? '🎓';
              const gradient = course.color ?? 'from-indigo-600 to-purple-600';

              return (
                <div
                  key={course.id}
                  className="min-w-[calc(33.333%-14px)] sm:min-w-[calc(50%-10px)] lg:min-w-[calc(33.333%-14px)] flex-shrink-0"
                >
                  <Link
                    href={`/academy/${course.slug}`}
                    className="group block h-full bg-gradient-to-br rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl relative"
                    style={{ background: undefined }}
                  >
                    <div className={`bg-gradient-to-br ${gradient} h-full flex flex-col p-7 relative min-h-[320px]`}>
                      {/* Background decoration */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full" />

                      {/* Icon + emoji */}
                      <div className="flex items-start justify-between mb-5 relative z-10">
                        <div className="w-13 h-13 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center w-14 h-14">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl">{emoji}</span>
                      </div>

                      {/* Level badge */}
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1 relative z-10">
                        {course.level}
                      </span>

                      {/* Title */}
                      <h3 className="text-2xl font-black text-white leading-tight mb-3 relative z-10">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow line-clamp-2 relative z-10">
                        {course.description}
                      </p>

                      {/* Footer */}
                      <div className="border-t border-white/20 pt-4 mt-auto relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-white font-black text-base">{course.price}</p>
                            <div className="flex items-center gap-1 text-white/60 text-xs">
                              <Clock className="w-3 h-3" /> {course.duration ?? '3 Months'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-white font-black text-sm group-hover:gap-2.5 transition-all bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl">
                            Enroll <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        {courses.length > CARDS_VISIBLE && (
          <div className="flex justify-center gap-1.5 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center mt-10">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-2xl text-slate-700 font-bold transition-all text-sm group"
          >
            Explore all {courses.length} Academy tracks
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
