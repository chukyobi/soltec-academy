'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  { id: 1, image: '/gallery1.jpg', alt: 'Classroom learning' },
  { id: 2, image: '/gallery2.jpg', alt: 'Office workspace' },
  { id: 3, image: '/gallery4.jpg', alt: 'Studio setup' },
  { id: 4, image: '/gallery3.jpg', alt: 'Learning environment' },
];

export function Partners() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Partners/Companies Row */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <div className="flex items-center justify-between gap-4 sm:gap-6 mb-8">
            <div className="flex flex-wrap gap-4 sm:gap-8 items-center flex-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <span key={i} className="text-gray-400 font-semibold text-sm sm:text-base whitespace-nowrap">
                  Google
                </span>
              ))}
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

          {/* Testimonial Images Carousel */}
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="flex gap-4 h-full transition-transform duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
              {testimonials.map((item) => (
                <div key={item.id} className="min-w-full h-full">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
