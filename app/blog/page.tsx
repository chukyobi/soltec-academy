import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const revalidate = 60; // ISR — refresh every 60 s

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />

      {/* Hero */}
      <div className="bg-white text-slate-900 pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/40 to-blue-300/40 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/40 to-pink-300/40 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

        <div className="max-w-[800px] mx-auto relative z-10 flex flex-col items-center text-center w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-widest text-indigo-500 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Soltec Insights
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Engineering &amp; <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Industry Insights</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-2xl">
            Read the latest technical articles, tutorials, and deep-dives from the Soltec Engineering team and our seasoned course instructors.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-20 relative z-20">
        {posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">No posts yet. Publish your first post from the Admin panel.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug ?? post.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col h-full"
              >
                <div className="relative h-56 w-full overflow-hidden shrink-0">
                  {post.image ? (
                    <Image
                      src={`https://images.unsplash.com/photo-${post.image}?auto=format&fit=crop&q=80&w=600`}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100" />
                  )}
                  {post.tag && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm">
                      {post.tag}
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 gap-2">
                    <span>{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-slate-600">{post.author ?? 'Soltec Team'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 leading-tight">{post.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6 flex-grow">{post.excerpt ?? post.content.slice(0, 120) + '…'}</p>
                  <div className="mt-auto border-t border-gray-100 pt-6 flex items-center justify-between text-indigo-600 font-bold text-sm tracking-widest uppercase">
                    Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
