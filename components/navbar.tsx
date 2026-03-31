'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';

export function Navbar({ theme = "light" }: { theme?: "light" | "dark" }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'COURSES', href: '/courses' },
    // { name: 'BOOK WORKSPACE', href: '/workspaces' },
    // { name: 'BLOG', href: '/blog' },
    // { name: 'ENGINEERING', href: '/engineering' },
    // { name: 'ABOUT US', href: '/about' },
    { name: 'TUTOR PANEL', href: '/instructor' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    tl.fromTo(logoRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      '-=0.4'
    );

    if (linksRef.current) {
      const links = linksRef.current.querySelectorAll('a');
      tl.fromTo(links,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      );
    }

    tl.fromTo(ctaRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      '-=0.2'
    );
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 opacity-0",
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-1"
            : "bg-transparent py-1"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div ref={logoRef}>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/soltec-academy-logo.png" alt="Logo" width={60} height={60} className="w-30 h-30 object-contain" />
              </Link>
            </div>

            {/* Menu Items (Desktop) */}
            <div ref={linksRef} className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "transition-colors text-sm",
                      (theme === "dark" && !isScrolled) ? "text-white hover:text-gray-300" : "text-gray-800 hover:text-primary",
                      isActive ? "font-semibold" : ""
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* CTA Button (Desktop) & Menu Button (Mobile) */}
            <div className="flex items-center gap-4">
              <div ref={ctaRef} className="hidden md:block">
                <Button className={cn("font-medium text-sm", (theme === "dark" && !isScrolled) ? "bg-white/20 hover:bg-white/30 text-white border-white/30" : "bg-white hover:bg-slate-200 text-black border border-slate-600")}>
                  Payment Guide
                </Button>
              </div>
              <button
                onClick={() => setIsOpen(true)}
                className={cn("md:hidden p-2 transition-colors", (theme === "dark" && !isScrolled) ? "text-white hover:text-gray-300" : "text-gray-800 hover:text-blue-600")}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-white z-[60] transition-transform duration-500 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full px-6 py-8">
          <div className="flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="flex flex-col gap-8 mt-12">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-black text-lg font-bold tracking-wider"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto pb-12">
            <Button className="w-full bg-white hover:bg-slate-50 text-black border border-slate-300 font-semibold py-6 rounded-xl shadow-lg">
              Payment Guide
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
