"use client";

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { Cpu, Server, CircuitBoard, Wrench } from 'lucide-react';

const ENGINEERING_DOMAINS = [
  { 
    id: 1, 
    title: 'Computer Engineering', 
    desc: 'Building intelligent hardware-software interfaces, optimizing embedded operating systems, and architecting real-time processing hubs.', 
    icon: Cpu,
    color: 'from-blue-500 to-indigo-600',
    slug: 'computer' 
  },
  { 
    id: 2, 
    title: 'Electrical Engineering', 
    desc: 'Designing sustainable power grids, advancing IoT sensor capabilities, and building robust transmission networks for the next generation.', 
    icon: Zap,
    color: 'from-emerald-500 to-teal-600',
    slug: 'electrical' 
  },
  { 
    id: 3, 
    title: 'Electronic Engineering', 
    desc: 'Prototyping advanced analog circuitry, modernizing signal processing, and pushing the boundaries of miniaturization.', 
    icon: CircuitBoard,
    color: 'from-purple-500 to-fuchsia-600',
    slug: 'electronic' 
  },
];

import { ArrowRight, Zap } from 'lucide-react';

export default function EngineeringPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />
      
      {/* Light Hero Section */}
      <div className="bg-white text-slate-900 pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/40 to-teal-300/40 rounded-full blur-[100px] -translate-y-1/2 -z-0 pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0], opacity: [0.4, 0.6, 0.4] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-200/40 to-blue-300/40 rounded-full blur-[120px] translate-y-1/2 -z-0 pointer-events-none" 
        />
        
        <div className="max-w-[900px] mx-auto relative z-10 flex flex-col items-center text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-widest text-emerald-600 mb-8">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               Soltec Engineering Labs
            </div>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Pioneering The <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600">Future of Hardware</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-2xl">
            Explore the cutting-edge innovations our internal teams are building across computer, electrical, and electronic engineering disciplines.
          </motion.p>
        </div>
      </div>

      <div className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-20 relative z-20">
         <div className="grid lg:grid-cols-3 gap-8">
            {ENGINEERING_DOMAINS.map((domain) => (
               <div key={domain.id} className="group bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 hover:shadow-2xl transition-all flex flex-col items-start cursor-pointer h-full relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${domain.color} rounded-bl-full opacity-[0.05] group-hover:opacity-[0.15] transition-opacity duration-700`}></div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${domain.color} text-white shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500`}>
                     <domain.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{domain.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-grow">{domain.desc}</p>
                  
                  <div className="mt-auto border-t border-gray-100 pt-6 flex items-center gap-2 font-bold text-sm tracking-widest uppercase text-slate-800 group-hover:text-cyan-600 transition-colors">
                     View Projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-24 bg-slate-900 rounded-[40px] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative z-10 lg:max-w-xl">
               <h2 className="text-4xl font-black text-white mb-6">Join Our Engineering Team</h2>
               <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  We are constantly looking for brilliant minds to tackle hard problems. If you have a passion for pushing electrons and compiling kernels, we want you.
               </p>
               <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black tracking-widest uppercase px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  View Open Positions
               </button>
            </div>
            <div className="relative z-10 flex-shrink-0">
               <div className="w-64 h-64 border-4 border-dashed border-slate-700 rounded-full flex items-center justify-center relative animate-[spin_20s_linear_infinite]">
                  <Wrench className="w-16 h-16 text-emerald-500 absolute top-0 -translate-y-1/2" />
                  <Cpu className="w-16 h-16 text-cyan-500 absolute bottom-0 translate-y-1/2" />
                  <CircuitBoard className="w-16 h-16 text-indigo-500 absolute left-0 -translate-x-1/2" />
                  <Server className="w-16 h-16 text-purple-500 absolute right-0 translate-x-1/2" />
               </div>
            </div>
         </div>
      </div>
      
      <Footer />
    </main>
  );
}
