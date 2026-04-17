'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  tag: string | null;
  author: string | null;
  slug: string | null;
  createdAt: Date;
}

interface Props {
  posts: BlogPost[];
}

export function Blog({ posts }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.max(posts.length, 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.max(posts.length, 1)) % Math.max(posts.length, 1));

  if (posts.length === 0) return null;

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
              aria-label="Previous post"
              className="p-2 sm:p-3 rounded-full border-2 border-gray-300 hover:border-pink-500 hover:text-pink-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next post"
              className="p-2 sm:p-3 rounded-full border-2 border-gray-300 hover:border-pink-500 hover:text-pink-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Blog Posts Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {posts.map((post, index) => {
            const href = `/blog/${post.slug ?? post.id}`;
            const imgSrc = post.image
              ? `https://images.unsplash.com/photo-${post.image}?auto=format&fit=crop&q=80&w=600`
              : null;
            const excerpt =
              post.excerpt ?? (post.content.length > 120 ? post.content.slice(0, 120) + '…' : post.content);

            return (
              <Link
                key={post.id}
                href={href}
                className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col ${
                  index !== currentSlide ? 'hidden md:flex' : 'flex'
                }`}
              >
                <div className="relative h-48 sm:h-56 md:h-48 w-full overflow-hidden shrink-0">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100" />
                  )}
                  {post.tag && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-pink-600 shadow-sm">
                      {post.tag}
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 sm:p-6 flex flex-col flex-grow">
                  <p className="text-xs text-gray-400 font-semibold mb-2">
                    {post.author ?? 'Soltec Team'} ·{' '}
                    {new Date(post.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{excerpt}</p>
                  <div className="flex items-center gap-1 text-pink-500 font-bold text-sm mt-auto">
                    Read more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Button asChild variant="outline" className="rounded-full px-6 sm:px-8">
            <Link href="/blog">All blog posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
