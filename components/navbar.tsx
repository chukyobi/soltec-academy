'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, Settings, Sun, Moon, BookOpen } from 'lucide-react';

interface NavProps {
  theme?: 'light' | 'dark';
  student?: { name: string; email: string } | null;
}

export function Navbar({ theme = 'light', student }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [classroomDark, setClassroomDark] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'ACADEMY', href: '/academy' },
    { name: 'COURSES', href: '/courses' },
    { name: 'BLOG', href: '/blog' },
    { name: 'STUDIO', href: '/studio' },
  ];

  const initials = student?.name
    ? student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(navRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    tl.fromTo(logoRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.4');
    if (linksRef.current) {
      const links = linksRef.current.querySelectorAll('a');
      tl.fromTo(links, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.3');
    }
    tl.fromTo(ctaRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2');
  }, []);

  async function handleLogout() {
    await fetch('/api/student/auth/logout');
    router.push('/');
    router.refresh();
  }

  const isDark = theme === 'dark' && !isScrolled;
  const textColor = isDark ? 'text-white hover:text-white/70' : 'text-gray-800 hover:text-indigo-600';
  const activeCls = 'font-black';

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300 opacity-0',
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-1'
            : 'bg-transparent py-1'
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

            {/* Desktop nav links */}
            <div ref={linksRef} className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn('transition-colors text-sm', textColor, isActive ? activeCls : '')}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* CTA / Profile */}
            <div className="flex items-center gap-3">
              <div ref={ctaRef} className="hidden md:flex items-center gap-2">
                {student ? (
                  /* ── Logged-in: avatar + dropdown ── */
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-bold',
                        isDark
                          ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                          : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                      )}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                        {initials}
                      </div>
                      <span>{student.name.split(' ')[0]}</span>
                      <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', profileOpen ? 'rotate-180' : '')} />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50">
                        {/* User info */}
                        <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <p className="font-black text-slate-900 text-sm">{student.name}</p>
                          <p className="text-slate-500 text-xs truncate">{student.email}</p>
                        </div>

                        <div className="py-1.5">
                          <Link
                            href="/student/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/academy"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                          >
                            <BookOpen className="w-4 h-4" />
                            My Courses
                          </Link>
                          <Link
                            href="/student/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>

                          {/* Classroom theme toggle */}
                          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 mt-1">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Classroom Mode</span>
                            <button
                              onClick={() => setClassroomDark(!classroomDark)}
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                                classroomDark
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-amber-100 text-amber-800'
                              )}
                            >
                              {classroomDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                              {classroomDark ? 'Dark' : 'Light'}
                            </button>
                          </div>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-slate-100"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Logged-out: Student Login + Get Started ── */
                  <>
                    <Link
                      href="/student/login"
                      className={cn(
                        'text-sm font-bold px-4 py-2 rounded-xl transition-all',
                        isDark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Student Login
                    </Link>
                    <Link
                      href="/academy"
                      className={cn(
                        'text-sm font-bold px-4 py-2 rounded-xl transition-all',
                        isDark
                          ? 'bg-white/15 border border-white/20 text-white hover:bg-white/25'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      )}
                    >
                      Get Started →
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(true)}
                className={cn('md:hidden p-2 transition-colors', isDark ? 'text-white hover:text-gray-300' : 'text-gray-800 hover:text-blue-600')}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 bg-white z-[60] transition-transform duration-500 md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full px-6 py-8">
          <div className="flex justify-end">
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-600 hover:text-black transition-colors" aria-label="Close menu">
              <X className="w-8 h-8" />
            </button>
          </div>

          {student && (
            <div className="flex items-center gap-3 mt-4 mb-2 p-4 bg-indigo-50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                {initials}
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{student.name}</p>
                <p className="text-slate-500 text-xs">{student.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 mt-8">
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

          <div className="mt-auto pb-12 space-y-3">
            {student ? (
              <>
                <Link href="/student/profile" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 transition-all">
                  My Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-center py-3 text-red-500 font-bold text-sm hover:text-red-700 transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/student/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:border-indigo-400 hover:text-indigo-600 transition-all">
                  Student Login
                </Link>
                <Link href="/academy" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 transition-all">
                  Explore Academy →
                </Link>
                <Link href="/tutor/login" onClick={() => setIsOpen(false)} className="block text-center text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Tutor Portal →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
