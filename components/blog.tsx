'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const blogPosts = [
  {
    id: 1,
    title: 'The secret to mastering product design',
    excerpt: 'Discover the proven methods and best practices that leading product designers use to create stunning interfaces.',
    author: 'Sarah Chen',
    role: 'Product Designer',
    image: '/blog-1.jpg',
  },
  {
    id: 2,
    title: 'The secret to mastering product design',
    excerpt: 'Learn how UX principles can transform your design thinking and create better user experiences.',
    author: 'Marcus Johnson',
    role: 'UX Lead',
    image: '/blog-2.jpg',
  },
  {
    id: 3,
    title: 'The secret to mastering product design',
    excerpt: 'Explore the latest trends in product design and how to apply them in your projects.',
    author: 'Emily Rodriguez',
    role: 'Design Director',
    image: '/blog-3.jpg',
  },
];

export function Blog() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % blogPosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + blogPosts.length) % blogPosts.length);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
            <span className="text-pink-500">Blog</span>
          </h2>
          <div className="flex gap-3">
            <button
              onClick={prevSlide}
              className="p-2 sm:p-3 rounded-full border-2 border-gray-300 hover:border-pink-500 hover:text-pink-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 sm:p-3 rounded-full border-2 border-gray-300 hover:border-pink-500 hover:text-pink-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Blog Posts Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <div
              key={post.id}
              className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                index !== currentSlide ? 'hidden md:block' : 'block'
              }`}
            >
              <div className="relative h-48 sm:h-56 md:h-48 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-white p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                    <p className="text-xs text-gray-500">{post.role}</p>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white">
                  Read more
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-full px-6 sm:px-8">
            All blog posts
          </Button>
        </div>
      </div>
    </section>
  );
}
