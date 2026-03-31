'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { MOCK_COURSES } from '@/lib/mock-data';

export function Courses() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % MOCK_COURSES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + MOCK_COURSES.length) % MOCK_COURSES.length);

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Try out one of our
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-pink-500">
              courses!
            </h2>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={prev} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={next} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Courses Carousel */}
        <div className="relative overflow-hidden mb-8">
          <div className="flex gap-4 sm:gap-6 transition-transform duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
            {MOCK_COURSES.map((course) => (
              <div
                key={course.id}
                className={`min-w-full sm:min-w-1/2 lg:min-w-1/3 bg-gradient-to-br ${course.color} rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col`}
              >
                <div className="mb-2 uppercase text-xs font-bold tracking-wider opacity-80">{course.level}</div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                  {course.title}
                </h3>
                <p className="text-sm sm:text-base opacity-90 mb-6 leading-relaxed flex-grow">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg sm:text-xl font-bold">
                    {course.price}
                  </span>
                  <Button asChild className={`${course.buttonColor} font-semibold px-6 sm:px-8`}>
                    <Link href={`/courses/${course.slug}`}>
                      See more
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Courses Link */}
        <div className="flex justify-center">
          <Link href="/courses">
            <button className="px-6 py-2 border-2 border-gray-300 rounded-full text-gray-700 font-semibold hover:border-gray-400 transition-colors text-sm sm:text-base">
              All courses →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
