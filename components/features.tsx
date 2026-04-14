'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface TabContent {
  title: string;
  duration: string;
  image: string;
  courseThumbnail: string;
  description: string;
  whatYouWillLearn: string[];
  features: Feature[];
}

const tabs = ['PRODUCT DESIGN', 'FRONTEND WEB DEV', 'BACKEND WEB DEV', 'DATA ANALYSIS', 'MOBILE APP DESIGN'] as const;
type TabName = typeof tabs[number];

const contentByTab: Record<TabName, TabContent> = {
  'PRODUCT DESIGN': {
    title: 'Learn in',
    duration: '3',
    image: '/students-design.jpg',
    courseThumbnail: '/blog-1.jpg',
    description: 'Dive into the exciting world of Product Design with our comprehensive course! From ideation to prototyping, discover the principles and tools used by industry experts. Perfect for beginners and aspiring designers, this course blends theory with hands-on project...',
    whatYouWillLearn: ['The theories of design', 'Wireframing', 'Basic UX process', 'Prototyping', 'Design thinking'],
    features: [
      { icon: '/la_chalkboard-teacher.svg', title: 'Experienced Tutors', description: 'Benefit from the guidance of seasoned professionals with a wealth of industry experience.' },
      { icon: '/solar_notes-outline.svg', title: 'Industry Standard Curriculum', description: 'Stay ahead in the field with a curriculum designed to align with current industry trends and demands.' },
      { icon: '/heroicons_tv.svg', title: 'State-of-the-Art Facilities', description: 'Immerse yourself in a dynamic learning atmosphere equipped with modern tools and resources.' },
      { icon: '/formkit_people.svg', title: 'Networking Opportunities', description: 'Forge valuable connections with fellow students and industry experts.' }
    ]
  },
  'FRONTEND WEB DEV': {
    title: 'Learn in',
    duration: '4',
    image: '/students-design.jpg',
    courseThumbnail: '/blog-2.jpg',
    description: 'Master the art of building responsive and interactive user interfaces. This course covers everything from modern CSS techniques to advanced JavaScript frameworks like React, ensuring you can build production-ready frontends.',
    whatYouWillLearn: ['HTML5 & Semantic Markup', 'Tailwind CSS & Animations', 'JavaScript ES6+', 'React & Next.js', 'Responsive Design Principles'],
    features: [
      { icon: '/la_chalkboard-teacher.svg', title: 'Experienced Tutors', description: 'Benefit from the guidance of seasoned professionals with a wealth of industry experience.' },
      { icon: '/solar_notes-outline.svg', title: 'Industry Standard Curriculum', description: 'Stay ahead in the field with a curriculum designed to align with current industry trends and demands.' },
      { icon: '/heroicons_tv.svg', title: 'State-of-the-Art Facilities', description: 'Immerse yourself in a dynamic learning atmosphere equipped with modern tools and resources.' },
      { icon: '/formkit_people.svg', title: 'Networking Opportunities', description: 'Forge valuable connections with fellow students and industry experts.' }
    ]
  },
  'BACKEND WEB DEV': {
    title: 'Learn in',
    duration: '5',
    image: '/students-design.jpg',
    courseThumbnail: '/blog-3.jpg',
    description: 'Deep dive into server-side programming, database management, and API design. Learn how to build scalable backends using Node.js, Express, and modern database solutions to power any application.',
    whatYouWillLearn: ['Server-side Logic with Node.js', 'Database Design (SQL & NoSQL)', 'RESTful API Architecture', 'Authentication & Security', 'Cloud Deployment'],
    features: [
      { icon: '/la_chalkboard-teacher.svg', title: 'Experienced Tutors', description: 'Benefit from the guidance of seasoned professionals with a wealth of industry experience.' },
      { icon: '/solar_notes-outline.svg', title: 'Industry Standard Curriculum', description: 'Stay ahead in the field with a curriculum designed to align with current industry trends and demands.' },
      { icon: '/heroicons_tv.svg', title: 'State-of-the-Art Facilities', description: 'Immerse yourself in a dynamic learning atmosphere equipped with modern tools and resources.' },
      { icon: '/formkit_people.svg', title: 'Networking Opportunities', description: 'Forge valuable connections with fellow students and industry experts.' }
    ]
  },
  'DATA ANALYSIS': {
    title: 'Learn in',
    duration: '4',
    image: '/students-design.jpg',
    courseThumbnail: '/hero-image.jpg',
    description: 'Turn raw data into actionable insights. Learn the most in-demand data analysis tools and techniques, including Python, SQL, and data visualization libraries to help businesses make data-driven decisions.',
    whatYouWillLearn: ['Data Cleaning & Prep', 'Statistical Analysis', 'Python for Data Science', 'Data Visualization (PowerBI/Tableau)', 'Advanced SQL Queries'],
    features: [
      { icon: '/la_chalkboard-teacher.svg', title: 'Experienced Tutors', description: 'Benefit from the guidance of seasoned professionals with a wealth of industry experience.' },
      { icon: '/solar_notes-outline.svg', title: 'Industry Standard Curriculum', description: 'Stay ahead in the field with a curriculum designed to align with current industry trends and demands.' },
      { icon: '/heroicons_tv.svg', title: 'State-of-the-Art Facilities', description: 'Immerse yourself in a dynamic learning atmosphere equipped with modern tools and resources.' },
      { icon: '/formkit_people.svg', title: 'Networking Opportunities', description: 'Forge valuable connections with fellow students and industry experts.' }
    ]
  },
  'MOBILE APP DESIGN': {
    title: 'Learn in',
    duration: '3',
    image: '/students-design.jpg',
    courseThumbnail: '/hero-img.jpg',
    description: 'Craft beautiful and intuitive mobile experiences. This course focuses on mobile-first design thinking, platform-specific guidelines (iOS & Android), and creating seamless handoffs for mobile developers.',
    whatYouWillLearn: ['Mobile-First Design', 'iOS & Android Guidelines', 'Advanced Prototyping', 'User Research for Mobile', 'App Store Assets Design'],
    features: [
      { icon: '/la_chalkboard-teacher.svg', title: 'Experienced Tutors', description: 'Benefit from the guidance of seasoned professionals with a wealth of industry experience.' },
      { icon: '/solar_notes-outline.svg', title: 'Industry Standard Curriculum', description: 'Stay ahead in the field with a curriculum designed to align with current industry trends and demands.' },
      { icon: '/heroicons_tv.svg', title: 'State-of-the-Art Facilities', description: 'Immerse yourself in a dynamic learning atmosphere equipped with modern tools and resources.' },
      { icon: '/formkit_people.svg', title: 'Networking Opportunities', description: 'Forge valuable connections with fellow students and industry experts.' }
    ]
  }
};

export function Features() {
  const [activeTab, setActiveTab] = useState<TabName>('PRODUCT DESIGN');
  const [activeSlide, setActiveSlide] = useState(0); // 0 for Features, 1 for Course Detail
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const current = contentByTab[activeTab];

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Entrance Animation
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || prefersReducedMotion) {
      gsap.set([titleRef.current, tabsRef.current, '.carousel-container', '.slide-content > *'], { opacity: 1, x: 0, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });

      tl.from(titleRef.current, {
        x: -100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
      })
        .from(tabsRef.current, {
          y: -30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        }, '-=0.8')
        .from('.carousel-container', {
          x: 100,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out',
        }, '-=1')
        .from('.slide-content > *', {
          y: 50,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        }, '-=0.5');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Course Tab Switch Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(sliderRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        onComplete: () => {
          gsap.fromTo(sliderRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
          );
        }
      });
    }, sliderRef);

    return () => ctx.revert();
  }, [activeTab]);

  // Slide Switch Animation & Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-20 px-4 sm:px-6 overflow-hidden bg-[#7C3AED] text-white min-h-[700px] lg:min-h-[800px] flex flex-col justify-center"
    >
      {/* Background Enhancements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#C026D3] to-[#F97316]" />
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#FF8C00] rounded-full blur-[100px] lg:blur-[160px] opacity-30 animate-pulse" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#7C3AED] rounded-full blur-[120px] lg:blur-[180px] opacity-40" />

      {/* Decorative SVG Curves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0,500 C200,400 300,600 500,500 C700,400 800,600 1000,500" fill="none" stroke="white" strokeWidth="2" />
          <path d="M0,700 C200,600 300,800 500,700 C700,600 800,800 1000,700" fill="none" stroke="white" strokeWidth="1" />
          <path d="M0,300 C200,200 300,400 500,300 C700,200 800,400 1000,300" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-screen-2xl mx-auto w-full relative z-10">

        {/* TABS NAVIGATION */}
        <nav ref={tabsRef} className="mb-8 lg:mb-12 overflow-x-auto no-scrollbar scroll-smooth">
          <ul className="flex gap-6 sm:gap-12 lg:gap-16 whitespace-nowrap justify-start lg:justify-start border-b border-white/10 pb-px">
            {tabs.map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs sm:text-base lg:text-lg font-black tracking-widest transition-all duration-500 uppercase relative pb-4 px-1 ${activeTab === tab ? 'text-yellow-400 opacity-100' : 'text-white/40 hover:text-white/80 opacity-70 hover:opacity-100'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400 rounded-full"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">

          {/* LEFT CONTENT: Hero text */}
          <div ref={titleRef} className="lg:col-span-5 relative text-center lg:text-left">
            <div className="flex flex-col">
              <h2 className="text-6xl sm:text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase mb-4 lg:mb-6 drop-shadow-2xl">
                Learn in
              </h2>
              <div className="relative flex items-center justify-center lg:justify-start">
                <h2 className="text-6xl sm:text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase z-20 drop-shadow-2xl">
                  months
                </h2>
                <span className="absolute left-[50%] lg:left-[45%] -bottom-6 lg:-bottom-24 text-[12rem] sm:text-[20rem] lg:text-[32rem] font-black text-white/10 leading-none select-none z-10 hover:text-white/15 transition-colors duration-700 pointer-events-none">
                  {current.duration}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Sub-Carousel for Features/Course Card */}
          <div className="lg:col-span-7 carousel-container relative">

            {/* Slide Navigation Buttons */}
            <div className="absolute -top-10 lg:-top-12 right-0 flex gap-3 z-30">
              <button
                onClick={() => setActiveSlide(0)}
                className={`w-10 lg:w-12 h-1.5 rounded-full transition-all duration-500 ${activeSlide === 0 ? 'bg-yellow-400 w-16 lg:w-20' : 'bg-white/20'}`}
                aria-label="Show Features"
              />
              <button
                onClick={() => setActiveSlide(1)}
                className={`w-10 lg:w-12 h-1.5 rounded-full transition-all duration-500 ${activeSlide === 1 ? 'bg-yellow-400 w-16 lg:w-20' : 'bg-white/20'}`}
                aria-label="Show Course Info"
              />
            </div>

            <div className="overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] min-h-[480px] lg:min-h-[500px]">
              <div ref={sliderRef} className="h-full touch-pan-y">
                <AnimatePresence mode="wait">
                  {activeSlide === 0 ? (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -50) setActiveSlide(1);
                      }}
                      className="flex flex-col gap-3 lg:gap-4 p-1 lg:p-2 cursor-grab active:cursor-grabbing"
                    >
                      {current.features.map((feature, index) => {
                        const isActive = hoveredFeature === index || (hoveredFeature === null && index === 2);
                        return (
                          <div
                            key={index}
                            onMouseEnter={() => setHoveredFeature(index)}
                            onMouseLeave={() => setHoveredFeature(null)}
                            className={`flex items-center gap-4 lg:gap-6 rounded-[1.5rem] lg:rounded-[2rem] p-3 lg:p-4 pr-6 lg:pr-10 transition-all duration-500 cursor-pointer group ${isActive
                              ? 'bg-white text-gray-900 shadow-xl scale-[1.01] lg:scale-[1.02]'
                              : 'bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20'
                              }`}
                          >
                            <div className="h-14 w-14 lg:h-20 lg:w-20 bg-white rounded-[1rem] lg:rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105">
                              <Image
                                src={feature.icon}
                                alt=""
                                width={24}
                                height={24}
                                className="transition-all duration-300 w-6 h-6 lg:w-8 lg:h-8"
                                style={{ filter: 'brightness(0)' }}
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h3 className={`text-base lg:text-xl font-bold mb-0.5 lg:mb-1 tracking-tight truncate ${isActive ? 'text-gray-900' : 'text-white'}`}>
                                {feature.title}
                              </h3>
                              <p className={`text-xs lg:text-sm leading-snug font-medium line-clamp-2 ${isActive ? 'text-gray-500' : 'text-white/70'}`}>
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="course"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 50) setActiveSlide(0);
                      }}
                      className="p-1 lg:p-2 flex justify-center cursor-grab active:cursor-grabbing"
                    >
                      <div className="w-full max-w-[400px] bg-white/10 backdrop-blur-3xl rounded-[2rem] lg:rounded-[2.5rem] border border-white/20 p-5 lg:p-6 flex flex-col shadow-2xl transition-all duration-500">
                        <div className="relative w-full aspect-[1.8] lg:aspect-[1.6] rounded-[1.25rem] lg:rounded-[1.5rem] overflow-hidden mb-3 lg:mb-4 shadow-xl">
                          <Image
                            src={current.courseThumbnail}
                            alt={activeTab}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute top-4 lg:top-6 left-4 lg:left-6">
                            <h4 className="text-lg lg:text-xl font-black uppercase tracking-wider text-white drop-shadow-lg">
                              {activeTab}
                            </h4>
                          </div>
                        </div>
                        <p className="text-white/80 text-xs lg:text-sm leading-relaxed mb-3 lg:mb-4 font-medium line-clamp-3 lg:line-clamp-none">
                          {current.description}
                        </p>
                        <div className="mb-3 lg:mb-4">
                          <h5 className="text-white font-black text-sm lg:text-base mb-2 lg:mb-3">You will learn:</h5>
                          <ul className="flex flex-col gap-1.5 lg:gap-2">
                            {current.whatYouWillLearn.slice(0, 4).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 lg:gap-3 text-white/90 text-[12px] lg:text-[13px] font-semibold">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
                                <span className="truncate">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link href="/courses" className="block text-center mt-auto w-full py-3.5 lg:py-4 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-full hover:scale-[1.02] transition-all duration-300 shadow-xl active:scale-95">
                          See more
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Slider Switcher Tip */}
            <p className="text-center mt-6 lg:mt-8 text-white/30 text-[10px] lg:text-xs font-bold tracking-[0.2em] lg:tracking-[0.3em] uppercase">
              Swipe or use indicators to switch
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}