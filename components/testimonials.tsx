'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    text: 'Exceptional training! The instructors brought real-world expertise to every class. I highly recommend this platform.',
    author: 'Alex Thompson',
    company: 'Tech Company Co.',
    rating: 5,
  },
  {
    id: 2,
    text: 'A well-structured learning journey that prepared me for industry challenges. The support team was incredible.',
    author: 'Jessica Martinez',
    company: 'Design Studio Inc.',
    rating: 5,
  },
  {
    id: 3,
    text: 'The best investment I made in my career. Expert instructors and practical projects made all the difference.',
    author: 'David Chen',
    company: 'Digital Agency Pro.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-black text-blue-600 mb-12 sm:mb-16">
          What people are saying
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
