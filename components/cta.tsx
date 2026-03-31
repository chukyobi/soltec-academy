'use client';

import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-red-500">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
          THE NEXT COHORT
        </h2>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 sm:mb-12 leading-tight">
          STARTS IN...
        </h2>

        {/* Countdown Timer Display */}
        <div className="flex justify-center items-center gap-4 sm:gap-6 mb-12 sm:mb-16">
          <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white">∞</span>
          <span className="text-4xl sm:text-5xl md:text-6xl text-white/70">:</span>
          <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white">∞</span>
          <span className="text-4xl sm:text-5xl md:text-6xl text-white/70">:</span>
          <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white">∞</span>
        </div>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
          We are still building, over plan to say welcoming, You can signup to stay updated on when new students!
        </p>

        {/* Newsletter Signup */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
          <Input
            type="email"
            placeholder="Enter your email address"
            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl flex-1 sm:flex-none sm:w-72 text-sm sm:text-base"
          />
          <Button className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
            Sign up
          </Button>
        </div>

        {/* CTA Link */}
        <Link href="/courses" className="inline-block text-white/80 hover:text-white transition-colors text-sm sm:text-base font-semibold">
          Start Learning →
        </Link>
      </div>
    </section>
  );
}
