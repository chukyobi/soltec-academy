'use client';

import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, FileText, Play, Share2, BookOpen, Award, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import gsap from 'gsap';

// Icons positioned along elliptical path around the hero image
const curvedIcons = [
  { src: '/javascript-path-icon.svg', pathPercent: 0.1 },
  { src: '/HTML-path-icon.svg', pathPercent: 0.2 },
  { src: '/figma-path-icon.svg', pathPercent: 0.3 },
  { src: '/css3-path-icon.svg', pathPercent: 0.4 },
  { src: '/react-path-icon.svg', pathPercent: 0.5 },
  { src: '/aws-path-icon.svg', pathPercent: 0.6 },
  { src: '/vue-path-icon.svg', pathPercent: 0.7 },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageSectionRef = useRef<HTMLDivElement>(null);
  const mobileImageRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const mobileIconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for mobile or reduced motion preferences to disable heavy animations
    const isMobile = window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || prefersReducedMotion) {
      // Ensure elements are visible when animations are disabled
      gsap.set([textRef.current, imageSectionRef.current, mobileImageRef.current], { opacity: 1 });
      
      if (iconsRef.current || mobileIconsRef.current) {
        const desktopIcons = iconsRef.current?.querySelectorAll('.icon-card') || [];
        const mobileIcons = mobileIconsRef.current?.querySelectorAll('.icon-card') || [];
        const allIcons = [...Array.from(desktopIcons), ...Array.from(mobileIcons)];
        gsap.set(allIcons, { opacity: 1, scale: 1, y: 0 });
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial state to prevent flash
    gsap.set([textRef.current, imageSectionRef.current], { opacity: 0 });

    tl.fromTo(textRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, stagger: 0.2 }
    );

    tl.fromTo([imageSectionRef.current, mobileImageRef.current],
      { x: 100, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out' },
      '-=0.8'
    );

    if (iconsRef.current || mobileIconsRef.current) {
      const desktopIcons = iconsRef.current?.querySelectorAll('.icon-card') || [];
      const mobileIcons = mobileIconsRef.current?.querySelectorAll('.icon-card') || [];
      const allIcons = [...Array.from(desktopIcons), ...Array.from(mobileIcons)];

      const desktopInners = iconsRef.current?.querySelectorAll('.icon-inner') || [];
      const mobileInners = mobileIconsRef.current?.querySelectorAll('.icon-inner') || [];
      const allInners = [...Array.from(desktopInners), ...Array.from(mobileInners)];

      tl.fromTo(allIcons,
        { scale: 0, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        },
        '-=0.5'
      );

      // Subtle floating animation for INNER icons only to avoid path misalignment
      gsap.to(allInners, {
        y: '+=8',
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.3,
          from: 'random'
        }
      });
    }

    // Bounce animation for the "now-icon"
    const nowIcon = textRef.current?.querySelector('.animate-bounce');
    if (nowIcon) {
      gsap.to(nowIcon, {
        y: -15,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }

    // Floating animation for fingertip vectors
    const fingertipVectors = imageSectionRef.current?.querySelectorAll('.fingertip-vector');
    if (fingertipVectors) {
      gsap.to(fingertipVectors, {
        y: '+=5',
        x: '+=3',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.2,
          from: 'center'
        }
      });
    }

  }, []);

  return (
    <div ref={containerRef} className="relative pt-20 pb-20 sm:pb-32 lg:pb-20 px-0 sm:px-6 lg:px-4 overflow-hidden min-h-[500px] flex items-start">
      {/* Absolute Positioned Right Image Section */}
      <div ref={imageSectionRef} className="absolute top-0 right-0 w-[60%] h-full hidden lg:flex items-center justify-end pointer-events-none opacity-0">
        <div
          className="relative z-0 w-full h-[95%] mt-[-10%] mr-[-2%] pointer-events-auto"
        >
          {/* The Shaped Image (Clipped) */}
          <div
            className="absolute inset-0 w-full h-full bg-yellow-400"
            style={{ clipPath: 'url(#uShapeMask)' }}
          >
            <Image
              src="/hero-img.png"
              alt="Students learning digital skills"
              fill
              loading="eager"
              className="object-cover"
            />
            {/* Fingertip Vectors */}
            <div className="fingertip-vector absolute top-[26%] left-[40%] w-8 h-8 z-10">
              <Image src="/Vector-15.png" alt="" width={10} height={10} className="object-contain" />
            </div>
            <div className="fingertip-vector absolute top-[22%] left-[45%] w-6 h-6 z-10">
              <Image src="/Vector-16.png" alt="" width={24} height={24} className="object-contain" />
            </div>
            <div className="fingertip-vector absolute top-[31%] left-[48%] w-7 h-7 z-10">
              <Image src="/Vector-17.png" alt="" width={28} height={28} className="object-contain" />
            </div>
          </div>

          {/* Floating Icon Cards perfectly following the U-shape path edge */}
          <div ref={iconsRef} className="absolute inset-0 w-full h-full pointer-events-none">
            {curvedIcons.map((item, index) => {
              const t = 1 - item.pathPercent;

              let px, py;
              if (t <= 0.5) {
                const nt = t * 2;
                px = Math.pow(1 - nt, 3) * 1 + 3 * Math.pow(1 - nt, 2) * nt * 0.5 + 3 * (1 - nt) * Math.pow(nt, 2) * 0.1 + Math.pow(nt, 3) * 0.1;
                py = Math.pow(1 - nt, 3) * 0 + 3 * Math.pow(1 - nt, 2) * nt * 0 + 3 * (1 - nt) * Math.pow(nt, 2) * 0.2 + Math.pow(nt, 3) * 0.6;
              } else {
                const nt = (t - 0.5) * 2;
                px = Math.pow(1 - nt, 3) * 0.1 + 3 * Math.pow(1 - nt, 2) * nt * 0.1 + 3 * (1 - nt) * Math.pow(nt, 2) * 0.5 + Math.pow(nt, 3) * 1;
                py = Math.pow(1 - nt, 3) * 0.6 + 3 * Math.pow(1 - nt, 2) * nt * 0.9 + 3 * (1 - nt) * Math.pow(nt, 2) * 1 + Math.pow(nt, 3) * 1;
              }

              return (
                <div
                  key={index}
                  className="icon-card absolute w-12 h-12 sm:w-14 sm:h-14 z-30 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 opacity-0"
                  style={{
                    left: `${px * 100}%`,
                    top: `${py * 100}%`,
                  }}
                >
                  <div className="icon-inner w-full h-full bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl border border-white/40 p-2 hover:scale-110 transition-all duration-500">
                    <div className="relative w-full h-full">
                      <Image
                        src={item.src}
                        alt="Tech Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SVG Mask Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="uShapeMask" clipPathUnits="objectBoundingBox">
            <path d="M1,0 C0.5,0 0.1,0.2 0.1,0.6 C0.1,0.9 0.5,1 1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto w-full px-0 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Top Section for Mobile: Image */}
          <div ref={mobileImageRef} className="lg:hidden relative w-full flex items-center justify-center mb-0 mt-0 h-[400px] opacity-0">
            <div className="relative z-20 w-full aspect-square">
              {/* The Shaped Image (Clipped) */}
              <div
                className="absolute inset-0 bg-yellow-400"
                style={{ clipPath: 'url(#uShapeMask)' }}
              >
                <Image src="/hero-img.png" alt="Hero" fill className="object-cover" />
                {/* Mobile Fingertip Vectors */}
                <div className="fingertip-vector absolute top-[26%] left-[40%] w-6 h-6 z-10">
                  <Image src="/Vector-15.png" alt="" width={18} height={18} className="object-contain" />
                </div>
                <div className="fingertip-vector absolute top-[22%] left-[45%] w-4 h-4 z-10">
                  <Image src="/Vector-16.png" alt="" width={22} height={22} className="object-contain" />
                </div>
                <div className="fingertip-vector absolute top-[31%] left-[48%] w-5 h-5 z-10">
                  <Image src="/Vector-17.png" alt="" width={24} height={24} className="object-contain" />
                </div>
              </div>

              {/* Mobile Tech Icons (Floating OUTSIDE the path) */}
              <div ref={mobileIconsRef} className="absolute inset-0 w-full h-full pointer-events-none">
                {curvedIcons.map((item, index) => {
                  const t = 1 - item.pathPercent;
                  let px, py;
                  if (t <= 0.5) {
                    const nt = t * 2;
                    px = Math.pow(1 - nt, 3) * 1 + 3 * Math.pow(1 - nt, 2) * nt * 0.5 + 3 * (1 - nt) * Math.pow(nt, 2) * 0.1 + Math.pow(nt, 3) * 0.1;
                    py = Math.pow(1 - nt, 3) * 0 + 3 * Math.pow(1 - nt, 2) * nt * 0 + 3 * (1 - nt) * Math.pow(nt, 2) * 0.2 + Math.pow(nt, 3) * 0.6;
                  } else {
                    const nt = (t - 0.5) * 2;
                    px = Math.pow(1 - nt, 3) * 0.1 + 3 * Math.pow(1 - nt, 2) * nt * 0.1 + 3 * (1 - nt) * Math.pow(nt, 2) * 0.5 + Math.pow(nt, 3) * 1;
                    py = Math.pow(1 - nt, 3) * 0.6 + 3 * Math.pow(1 - nt, 2) * nt * 0.9 + 3 * (1 - nt) * Math.pow(nt, 2) * 1 + Math.pow(nt, 3) * 1;
                  }
                  return (
                    <div
                      key={index}
                      className="icon-card absolute w-8 h-8 z-30 pointer-events-auto transform -translate-x-[120%] -translate-y-1/2 opacity-0"
                      style={{
                        left: `${px * 100}%`,
                        top: `${py * 100}%`,
                      }}
                    >
                      <div className="icon-inner w-full h-full bg-white/95 backdrop-blur-md rounded-lg flex items-center justify-center shadow-md p-1.5 transition-all duration-500">
                        <Image src={item.src} alt="icon" width={20} height={20} className="object-contain" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Left Content (Second on Mobile) */}
          <div ref={textRef} className="flex flex-col justify-center z-10 opacity-0 text-left px-6 sm:px-0">
            <div className="relative">
              <h1 className="text-[40px] leading-[1.1] sm:text-6xl lg:text-[64px] font-bold text-gray-900 tracking-[-0.03em] mb-4 sm:mb-6 font-barlow">
                Best place to learn a
                <br />
                new{" "}
                <span className="text-blue-600 relative whitespace-nowrap">
                  digital skill
                  <span className="absolute -top-1 -right-16 lg:-right-20 pointer-events-none animate-bounce">
                    <Image
                      src="/now-icon.png"
                      alt="Now Icon"
                      width={64}
                      height={64}
                      className="opacity-90 w-14 sm:w-14 lg:w-16 h-auto"
                    />
                  </span>
                </span>
              </h1>

              <p className="text-gray-600 text-sm sm:text-base mb-8 sm:mb-8 leading-relaxed max-w-sm">
                Opening new frontiers for learning, one course at a time.
                Soltec aims to equip every kind of individual with their desired skill.
                All that is needed from you is drive and passion. We handle the rest.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-6 w-full sm:w-auto rounded-xl shadow-lg shadow-blue-200 group">
                <Link href="/courses">
                  Enroll now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-6 w-full sm:w-auto rounded-xl shadow-sm">
                <Link href="/courses">
                  <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                  Enter Classroom
                </Link>
              </Button>
            </div>

            {/* Trust Section: International Recognition */}
            <div className="mt-12 pt-6 border-t border-gray-100/10">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                Internationally Recognized & Accredited
              </p>
              <div className="flex flex-wrap gap-6 sm:gap-10 items-center opacity-80">
                <div className="flex items-center gap-2 group cursor-help">
                  <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600 shadow-sm border border-yellow-100">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-tight">CPD Accredited</span>
                </div>
                <div className="flex items-center gap-2 group cursor-help">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-tight">Global Partner</span>
                </div>
                <div className="flex items-center gap-2 group cursor-help">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-tight">ISO 9001 Standards</span>
                </div>
                <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block" />
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] font-black text-gray-300 uppercase">Trusted by</span>
                  <div className="flex gap-4">
                    <span className="text-sm font-black text-gray-400 grayscale">GOOGLE</span>
                    <span className="text-sm font-black text-gray-400 grayscale">AMAZON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Spacer for Desktop */}
          <div className="hidden lg:block h-[500px]"></div>
        </div>
      </div>
    </div>
  );
}
