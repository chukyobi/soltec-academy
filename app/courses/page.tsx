import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BookOpen, TrendingUp } from 'lucide-react';
import prisma from '@/lib/prisma';
import CoursesCatalogClient from './CoursesCatalogClient';

export const revalidate = 60;

export default async function CoursesCatalog() {
  const courses = await prisma.academyCourse.findMany({
    orderBy: { title: 'asc' },
  });

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />

      {/* Hero */}
      <div className="bg-white text-slate-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[60vh] flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/30 via-purple-300/30 to-blue-300/30 rounded-full blur-[100px] -translate-y-1/2 z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-red-200/30 rounded-full blur-[120px] translate-y-1/2 z-0 pointer-events-none" />

        <div className="absolute top-1/4 left-[15%] hidden lg:flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl border border-gray-100 z-10">
          <BookOpen className="w-8 h-8 text-blue-500" />
        </div>
        <div className="absolute bottom-1/4 right-[15%] hidden lg:flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl border border-gray-100 z-10">
          <TrendingUp className="w-10 h-10 text-emerald-500" />
        </div>

        <div className="max-w-[1000px] mx-auto relative z-10 flex flex-col items-center text-center w-full mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-widest text-blue-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Soltec Academy Catalog
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-slate-900 leading-[1.05]">
            Master The Skills <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Of Tomorrow</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-2xl">
            Explore our curated catalog of elite courses designed by industry experts. Accelerate your career with real-world projects.
          </p>

          {/* Interactive client component handles search + grid */}
          <CoursesCatalogClient courses={courses as Parameters<typeof CoursesCatalogClient>[0]['courses']} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
