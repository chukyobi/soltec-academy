"use client";

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { Check, Zap, Coffee, Wifi } from 'lucide-react';

const PLANS = [
  { name: "Daily Pass", price: "NGN 5,000", period: "/day", features: ["Fast Wi-Fi", "Free Coffee", "Access to open areas", "9AM - 5PM access"] },
  { name: "Weekly Flex", price: "NGN 20,000", period: "/week", popular: true, features: ["Fast Wi-Fi", "Free Coffee & Snacks", "Dedicated desk", "24/7 Access", "1 hr conference room"] },
  { name: "Monthly Pro", price: "NGN 60,000", period: "/month", features: ["Ultra-fast Wi-Fi", "Unlimited Coffee", "Private pod access", "24/7 Access", "5 hrs conference room", "Mail handling"] },
];

export default function WorkspacesPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />
      
      {/* Light Hero Section */}
      <div className="bg-white text-slate-900 pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/40 to-orange-300/40 rounded-full blur-[100px] -translate-y-1/2 -z-0 pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-blue-200/40 to-cyan-300/40 rounded-full blur-[120px] translate-y-1/2 -z-0 pointer-events-none" 
        />
        
        <div className="max-w-[800px] mx-auto relative z-10 flex flex-col items-center text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-widest text-orange-500 mb-8">
               <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
               Soltec Hub
            </div>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Your Premium <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Workspace Hub</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-2xl">
            Book a dedicated desk, a private office, or a conference room. Join a vibrant community of tech innovators and creators.
          </motion.p>
        </div>
      </div>

      <div className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-20 relative z-20">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[ 
              { icon: Wifi, title: "Fiber Internet", desc: "Symmetrical gigabit speeds" },
              { icon: Coffee, title: "Artisan Lounge", desc: "Unlimited premium coffee" },
              { icon: Zap, title: "Power Backup", desc: "24/7 Uninterrupted power" },
              { icon: Check, title: "Secure Access", desc: "Biometric entry points" },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4"><f.icon className="w-6 h-6" /></div>
                 <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                 <p className="text-sm text-slate-500 font-medium">{f.desc}</p>
              </div>
            ))}
         </div>

         <div className="text-center mb-12">
           <h2 className="text-4xl font-black mb-4">Choose Your Plan</h2>
           <p className="text-slate-500 font-medium">Flexible options for freelancers, startups, and remote workers.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
            {PLANS.map((plan, i) => (
               <div key={i} className={`bg-white rounded-[32px] p-8 flex flex-col ${plan.popular ? 'border-2 border-orange-500 shadow-xl relative scale-105' : 'border border-gray-100 shadow-sm'}`}>
                  {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full">Most Popular</div>}
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                     <span className="text-4xl font-black">{plan.price}</span>
                     <span className="text-slate-500 font-medium">{plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                     {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                           <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                             <Check className="w-3 h-3 text-emerald-600" />
                           </div>
                           {f}
                        </li>
                     ))}
                  </ul>
                  <button className={`w-full py-4 rounded-xl font-bold transition-all shadow-md ${plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                     Book Now
                  </button>
               </div>
            ))}
         </div>
      </div>
      
      <Footer />
    </main>
  );
}
