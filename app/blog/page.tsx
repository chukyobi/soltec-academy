"use client";

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import Image from 'next/image';

const POSTS = [
  { id: 1, title: 'The Future of AI in Education', excerpt: 'How predictive models and LLMs are democratizing top-tier education.', author: 'Dr. Jane Smith', date: 'Oct 12, 2026', img: '1515378791033-cdedfa2b545f', tag: 'AI & Tech' },
  { id: 2, title: 'Building Scalable Node.js APIs', excerpt: 'A comprehensive guide to structuring enterprise-grade backend services.', author: 'Alex Rivera', date: 'Sep 28, 2026', img: '1461749280684-dccba630e2f6', tag: 'Engineering' },
  { id: 3, title: 'Design Systems for Startups', excerpt: 'Why creating a robust design token system saves hundreds of developer hours.', author: 'Taylor Wong', date: 'Sep 15, 2026', img: '1504384308090-c894fdcc538d', tag: 'Design' },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />
      
      {/* Light Hero Section */}
      <div className="bg-white text-slate-900 pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/40 to-blue-300/40 rounded-full blur-[100px] -translate-y-1/2 -z-0 pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0], opacity: [0.4, 0.6, 0.4] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/40 to-pink-300/40 rounded-full blur-[120px] translate-y-1/2 -z-0 pointer-events-none" 
        />
        
        <div className="max-w-[800px] mx-auto relative z-10 flex flex-col items-center text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-widest text-indigo-500 mb-8">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               Soltec Insights
            </div>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Engineering & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Industry Insights</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-2xl">
            Read the latest technical articles, tutorials, and deep-dives from the Soltec Engineering team and our seasoned course instructors.
          </motion.p>
        </div>
      </div>

      <div className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-20 relative z-20">
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post) => (
               <div key={post.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col h-full cursor-pointer">
                  <div className="relative h-56 w-full overflow-hidden shrink-0">
                     <Image
                        src={`https://images.unsplash.com/photo-${post.img}?auto=format&fit=crop&q=80&w=600`}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm">
                        {post.tag}
                     </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                     <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 gap-2">
                        <span>{post.date}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span className="text-slate-600">{post.author}</span>
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 leading-tight">{post.title}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed mb-6 flex-grow">{post.excerpt}</p>
                     
                     <div className="mt-auto border-t border-gray-100 pt-6 flex items-center justify-between text-indigo-600 font-bold text-sm tracking-widest uppercase">
                        Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
      
      <Footer />
    </main>
  );
}
