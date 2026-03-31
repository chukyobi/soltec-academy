"use client";

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { Users, Target, Rocket, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />
      
      {/* Light Hero Section */}
      <div className="bg-white text-slate-900 pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-rose-200/40 to-pink-300/40 rounded-full blur-[100px] -translate-y-1/2 -z-0 pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0], opacity: [0.4, 0.6, 0.4] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-violet-200/40 to-purple-300/40 rounded-full blur-[120px] translate-y-1/2 -z-0 pointer-events-none" 
        />
        
        <div className="max-w-[900px] mx-auto relative z-10 flex flex-col items-center text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-widest text-rose-500 mb-8">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               About Soltec
            </div>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Our Mission is <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-violet-600">Empowering You</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-2xl">
            Born out of the desire to bridge the global digital skills divide, Soltec combines world-class engineering with a deep passion for education context to unleash your true potential.
          </motion.p>
        </div>
      </div>

      <div className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-20 relative z-20">
         <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="space-y-6">
               <h2 className="text-4xl font-black text-slate-900 leading-tight">We Believe the Future Belongs to the Builders.</h2>
               <div className="w-20 h-1.5 bg-gradient-to-r from-rose-500 to-violet-600 rounded-full"></div>
               <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  We started with a simple question: "Why is high-quality technology education so fragmented?" Soltec was built to provide an integrated hub where learning, practical engineering, and premium workspaces intersect.
               </p>
               <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Whether you are writing your first line of code, architecting a scalable global network, or looking for a professional workspace, we are here to support your journey.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {[
                 { v: "50K+", l: "Students globally" },
                 { v: "120+", l: "Master courses" },
                 { v: "4.9/5", l: "Average rating" },
                 { v: "98%", l: "Career Growth" },
               ].map((stat, i) => (
                 <div key={i} className={`bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-lg border border-gray-100 ${i % 2 === 1 ? 'translate-y-8' : ''}`}>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-violet-600 mb-2">{stat.v}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{stat.l}</div>
                 </div>
               ))}
            </div>
         </div>

         <div className="mb-24">
           <h2 className="text-3xl font-black text-center mb-16">Our Core Values</h2>
           <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Users, t: "Community First", c: "from-blue-500 to-cyan-500" },
                { icon: Target, t: "Radical Focus", c: "from-rose-500 to-orange-500" },
                { icon: Rocket, t: "Scale Quickly", c: "from-purple-500 to-indigo-500" },
                { icon: Heart, t: "Build with Empathy", c: "from-emerald-500 to-teal-500" },
              ].map((val, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-[32px] hover:bg-white border border-transparent hover:border-gray-200 transition-all hover:shadow-xl">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${val.c} text-white flex items-center justify-center mb-6 shadow-lg`}>
                       <val.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-xl mb-2">{val.t}</h3>
                </div>
              ))}
           </div>
         </div>
         
         <div className="bg-slate-900 overflow-hidden rounded-[40px] relative px-8 py-20 text-center flex flex-col items-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px]" />
            <h2 className="text-4xl font-black text-white relative z-10 mb-6">Ready to shape your future?</h2>
            <p className="text-slate-400 text-lg relative z-10 max-w-xl mb-10">
               Join our robust platform today. Start learning from industry leaders and unlock your engineering prowess.
            </p>
            <button className="bg-white text-slate-900 font-black tracking-widest uppercase px-10 py-5 rounded-full hover:scale-105 transition-transform shadow-2xl relative z-10">
               Explore Academy
            </button>
         </div>
      </div>
      
      <Footer />
    </main>
  );
}
