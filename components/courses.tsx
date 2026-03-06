'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const courses = [
  {
    title: 'Data Analysis',
    description: 'Get a solid grasp on concepts needed to work with data to land your first job',
    price: 'NGN5,000',
    color: 'from-blue-900 to-blue-800',
    buttonColor: 'bg-white text-blue-900 hover:bg-blue-50',
  },
  {
    title: 'Product Design',
    description: 'Get a solid grasp on concepts needed to work with design to land your first job',
    price: 'NGN5,000',
    color: 'from-purple-600 to-purple-500',
    buttonColor: 'bg-white text-purple-600 hover:bg-purple-50',
  },
  {
    title: 'Frontend Web Dev',
    description: 'Get a solid grasp on concepts needed for frontend development to land your first job',
    price: 'NGN5,000',
    color: 'from-cyan-500 to-teal-500',
    buttonColor: 'bg-white text-cyan-600 hover:bg-cyan-50',
  },
  {
    title: 'Backend Web Dev',
    description: 'Get a solid grasp on concepts needed for backend development to land your first job',
    price: 'NGN5,000',
    color: 'from-green-500 to-emerald-500',
    buttonColor: 'bg-white text-green-600 hover:bg-green-50',
  },
];

export function Courses() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % courses.length);
  const prev = () => setCurrent((prev) => (prev - 1 + courses.length) % courses.length);

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
            {courses.map((course, index) => (
              <div
                key={index}
                className={`min-w-full sm:min-w-1/2 lg:min-w-1/3 bg-gradient-to-br ${course.color} rounded-2xl p-6 sm:p-8 text-white shadow-lg`}
              >
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                  {course.title}
                </h3>
                <p className="text-sm sm:text-base opacity-90 mb-6 leading-relaxed">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg sm:text-xl font-bold">
                    {course.price}
                  </span>
                  <Button className={`${course.buttonColor} font-semibold px-6 sm:px-8`}>
                    Enroll now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Courses Link */}
        <div className="flex justify-center">
          <button className="px-6 py-2 border-2 border-gray-300 rounded-full text-gray-700 font-semibold hover:border-gray-400 transition-colors text-sm sm:text-base">
            All courses →
          </button>
        </div>
      </div>
    </section>
  );
}
