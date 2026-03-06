'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const gallerySets = [
  {
    id: 1,
    images: {
      tl: '/gallery1.jpg',
      tr: '/gallery2.jpg',
      bl: '/gallery4.jpg',
      right: '/gallery3.jpg'
    }
  },
  {
    id: 2,
    images: {
      tl: '/blog-1.jpg',
      tr: '/blog-2.jpg',
      bl: '/testimonial-3.jpg',
      right: '/blog-3.jpg'
    }
  }
];

export function FrontGallery() {
  const [activeSet, setActiveSet] = useState(0);

  const nextSet = () => setActiveSet((prev) => (prev + 1) % gallerySets.length);
  const prevSet = () => setActiveSet((prev) => (prev - 1 + gallerySets.length) % gallerySets.length);

  const current = gallerySets[activeSet].images;

  return (
    <section className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Navigation Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-10 lg:mb-12 text-center lg:text-left">
          <div className="max-w-xl mb-6 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-gray-900 mb-3 lg:mb-4">
              Community in Action
            </h2>
            <p className="text-gray-500 font-medium text-sm lg:text-lg leading-relaxed px-4 lg:px-0">
              Step inside Soltec Engineering Academy and see how we're shaping the future of tech.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={prevSet}
              className="p-3 lg:p-4 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-sm active:scale-90"
              aria-label="Previous Gallery"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSet}
              className="p-3 lg:p-4 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-sm active:scale-90"
              aria-label="Next Gallery"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Gallery Grid Wrapper with Sliding & Swipe Animation */}
        <div className="relative min-h-[400px] lg:min-h-[644px] touch-pan-y">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSet}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) nextSet();
                if (info.offset.x > 50) prevSet();
              }}
              className="flex flex-col lg:flex-row gap-4 lg:gap-6 cursor-grab active:cursor-grabbing"
            >

              {/* LEFT BLOCK: 2x2 Grid */}
              <div className="w-full lg:w-[45%] flex flex-col gap-4 lg:gap-6">
                <div className="grid grid-cols-2 gap-4 lg:gap-6 h-[180px] sm:h-[250px] lg:h-[300px]">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl lg:shadow-2xl"
                  >
                    <Image
                      src={current.tl}
                      alt="Classroom learning"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl lg:shadow-2xl"
                  >
                    <Image
                      src={current.tr}
                      alt="Display monitor"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative h-[180px] sm:h-[250px] lg:h-[320px] rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl lg:shadow-2xl"
                >
                  <Image
                    src={current.bl}
                    alt="Academy spaces"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                </motion.div>
              </div>

              {/* RIGHT BLOCK: Tall */}
              <div className="w-full lg:w-[55%]">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative h-[350px] sm:h-[450px] lg:h-[644px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-xl lg:shadow-2xl group"
                >
                  <Image
                    src={current.right}
                    alt="Academy Exterior/Focus"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicators (Dots) */}
        <div className="flex justify-center gap-2 mt-8">
          {gallerySets.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSet(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${activeSet === idx ? 'w-8 bg-gray-900' : 'w-2 bg-gray-200'
                }`}
              aria-label={`Go to gallery set ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
