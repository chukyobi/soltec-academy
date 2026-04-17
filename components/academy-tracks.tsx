'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ElementType } from 'react';
import { FiBarChart2, FiCode, FiDatabase, FiArrowRight, FiUsers, FiClock, FiCalendar, FiZap } from 'react-icons/fi';
import { MdOutlineDesignServices, MdOutlineComputer } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import { RiGraduationCapLine } from 'react-icons/ri';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  price: string;
  color: string | null;
  cohortStatus: 'active' | 'upcoming' | 'none';
  cohortStartDate: string | null;
  cohortEndDate: string | null;
  cohortId: string | null;
  enrolledCount: number;
  maxStudents: number;
  cohortName: string | null;
  cohortPrice: number | null;
}

interface Props { courses: Course[] }

const SLUG_ICONS: Record<string, ElementType> = {
  'product-design': MdOutlineDesignServices,
  'ui-ux-design': MdOutlineComputer,
  'data-analysis': FiBarChart2,
  'frontend-web-dev': FiCode,
  'backend-web-dev': FiDatabase,
};

const SLUG_THEMES: Record<string, {
  bg: string; border: string; badge: string;
  iconBg: string; iconColor: string;
  cta: string; pill: string;
}> = {
  'product-design':   { bg: 'bg-rose-50',    border: 'border-rose-100',    badge: 'bg-rose-100 text-rose-700',    iconBg: 'bg-gradient-to-br from-rose-500 to-fuchsia-600',    iconColor: 'text-white', cta: 'bg-gradient-to-r from-rose-500 to-fuchsia-600',   pill: 'bg-rose-100 text-rose-600' },
  'ui-ux-design':     { bg: 'bg-violet-50',  border: 'border-violet-100',  badge: 'bg-violet-100 text-violet-700',  iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600',  iconColor: 'text-white', cta: 'bg-gradient-to-r from-violet-500 to-indigo-600',  pill: 'bg-violet-100 text-violet-600' },
  'data-analysis':    { bg: 'bg-amber-50',   border: 'border-amber-100',   badge: 'bg-amber-100 text-amber-700',   iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',   iconColor: 'text-white', cta: 'bg-gradient-to-r from-amber-500 to-orange-500',   pill: 'bg-amber-100 text-amber-600' },
  'frontend-web-dev': { bg: 'bg-sky-50',     border: 'border-sky-100',     badge: 'bg-sky-100 text-sky-700',     iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',     iconColor: 'text-white', cta: 'bg-gradient-to-r from-sky-500 to-blue-600',    pill: 'bg-sky-100 text-sky-600' },
  'backend-web-dev':  { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600', iconColor: 'text-white', cta: 'bg-gradient-to-r from-emerald-500 to-teal-600', pill: 'bg-emerald-100 text-emerald-600' },
};

const FALLBACK_THEME = { bg: 'bg-indigo-50', border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-700', iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600', iconColor: 'text-white', cta: 'bg-gradient-to-r from-indigo-500 to-purple-600', pill: 'bg-indigo-100 text-indigo-600' };

function fmtDate(iso: string | null) {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtNGN(n: number) {
  return `₦${n.toLocaleString('en-NG')}`;
}

export function AcademyTracks({ courses }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (courses.length === 0) return null;

  // Priority: active > upcoming > none — show only top 3
  const ordered = [
    ...courses.filter(c => c.cohortStatus === 'active'),
    ...courses.filter(c => c.cohortStatus === 'upcoming'),
    ...courses.filter(c => c.cohortStatus === 'none'),
  ].slice(0, 3);

  const activeCnt = courses.filter(c => c.cohortStatus === 'active').length;
  const upcomingCnt = courses.filter(c => c.cohortStatus === 'upcoming').length;

  return (
    <section className="py-24 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-black uppercase tracking-widest mb-5">
              <HiSparkles className="w-3.5 h-3.5" />
              {activeCnt} Live · {upcomingCnt} Opening Soon
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Skill Tracks
            </h2>
            <p className="text-slate-500 text-lg mt-3 max-w-xl leading-relaxed">
              Structured 3-month cohorts. Live tutor sessions, real projects, and a certificate.
            </p>
          </div>
          <Link
            href="/academy"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all text-sm shadow-lg shadow-indigo-200 group"
          >
            See all {courses.length} tracks <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
          {[
            { label: 'Tracks', value: `${courses.length}`, icon: RiGraduationCapLine, color: 'text-indigo-600' },
            { label: 'Live Cohorts', value: `${activeCnt}`, icon: FiZap, color: 'text-green-600' },
            { label: 'Class Size', value: '≤ 20', icon: FiUsers, color: 'text-amber-600' },
            { label: 'Duration', value: '3 Months', icon: FiClock, color: 'text-sky-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <div>
                <p className="text-slate-900 font-black text-xl leading-none">{value}</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3-card grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordered.map((course) => {
            const Icon = SLUG_ICONS[course.slug] ?? FiCode;
            const theme = SLUG_THEMES[course.slug] ?? FALLBACK_THEME;
            const isHov = hovered === course.id;
            const spotsLeft = course.maxStudents - course.enrolledCount;
            const pct = Math.min(100, Math.round((course.enrolledCount / course.maxStudents) * 100));

            return (
              <Link
                key={course.id}
                href={`/academy/${course.slug}`}
                onMouseEnter={() => setHovered(course.id)}
                onMouseLeave={() => setHovered(null)}
                className={`group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${theme.bg} ${theme.border} ${isHov ? 'shadow-xl' : 'shadow-md'}`}
              >
                {/* Status ribbon */}
                {course.cohortStatus === 'active' && (
                  <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                  </div>
                )}
                {course.cohortStatus === 'upcoming' && (
                  <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30">
                    <FiZap className="w-2.5 h-2.5" /> Soon
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg ${theme.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-7 h-7 ${theme.iconColor}`} />
                  </div>

                  {/* Level */}
                  <span className={`self-start text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${theme.pill}`}>
                    {course.level}
                  </span>

                  {/* Title + desc */}
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-5">
                    {course.description}
                  </p>

                  {/* Cohort info box */}
                  {course.cohortStatus !== 'none' && course.cohortStartDate && (
                    <div className="bg-white/70 backdrop-blur border border-white/80 rounded-2xl p-4 mb-5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {course.cohortStatus === 'active' ? 'Ends' : 'Starts'}
                        </span>
                        <span className="text-slate-800 font-black text-xs">
                          {course.cohortStatus === 'active' ? fmtDate(course.cohortEndDate) : fmtDate(course.cohortStartDate)}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{spotsLeft} spots left</span>
                          <span>{course.enrolledCount}/{course.maxStudents}</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${theme.cta}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-black/5">
                    <div>
                      <p className="text-slate-900 font-black text-lg">
                        {course.cohortPrice ? fmtNGN(course.cohortPrice) : course.price}
                      </p>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <FiClock className="w-3 h-3" /> {course.duration}
                      </p>
                    </div>
                    <div className={`px-4 py-2.5 rounded-xl text-white text-sm font-black flex items-center gap-2 transition-all group-hover:gap-3 ${theme.cta} shadow-lg`}>
                      {course.cohortStatus === 'active' ? 'Enroll' : 'Details'}
                      <FiArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all CTA */}
        <div className="mt-14 text-center">
          <p className="text-slate-400 text-sm mb-5">
            Showing {ordered.length} of {courses.length} tracks &mdash; explore the full academy to see all courses.
          </p>
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-700 text-white font-black rounded-2xl transition-all text-sm shadow-xl"
          >
            Explore Full Academy <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
