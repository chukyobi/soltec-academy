import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  LayoutDashboard, Upload, BookOpen, DollarSign, Bell,
  Settings, LogOut, ChevronRight, Sparkles, Star
} from "lucide-react";

const NAV = [
  { href: "/studio", label: "Overview", icon: LayoutDashboard },
  { href: "/studio/upload", label: "Upload Course", icon: Upload },
  { href: "/studio/courses", label: "My Courses", icon: BookOpen },
  { href: "/studio/earnings", label: "Earnings", icon: DollarSign },
];

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isCreator = session ? (session.user.role === "CREATOR" || session.user.role === "ADMIN") : false;
  const initials = (session?.user.name ?? session?.user.email ?? "C")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#09090f] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-[#0c0c18] border-r border-white/[0.05] flex flex-col h-screen sticky top-0 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-indigo-600/0 via-indigo-500/50 to-indigo-600/0" />

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.05]">
          <Link href="/studio" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-tight tracking-tight">Soltec Studio</p>
              <p className="text-indigo-400/60 text-[10px] font-bold uppercase tracking-widest">Creator Platform</p>
            </div>
          </Link>
        </div>

        {/* Creator badge */}
        {session ? (
          <div className="mx-4 mt-5 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-500/15 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-indigo-500/20">
                {initials}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-white text-xs font-bold truncate">{session.user.name ?? "Creator"}</p>
                <p className="text-slate-500 text-[10px] truncate">{session.user.email}</p>
              </div>
            </div>
            {isCreator && (
              <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1">
                <Star className="w-3 h-3 text-indigo-400" />
                <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Verified Creator</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-4 mt-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className="text-slate-500 text-xs mb-3">Not signed in as a creator</p>
            <Link href="/studio/login" className="block w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition text-center">
              Sign In →
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Menu</p>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <Icon className="w-4 h-4 shrink-0 group-hover:text-indigo-400 transition-colors" />
              <span className="text-sm font-medium">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/[0.05] space-y-0.5">
          <Link href="/studio/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Notifications</span>
          </Link>
          <Link href="/studio/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          {session && (
            <a href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign out</span>
            </a>
          )}
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-400 transition-all">
            <span className="text-xs">← Back to site</span>
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-[#09090f]/90 backdrop-blur border-b border-white/[0.05] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isCreator && session && (
              <Link
                href="/studio/signup"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white text-xs font-black rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                ✦ Become a Creator
              </Link>
            )}
            {!session && (
              <Link href="/studio/login" className="text-slate-400 hover:text-white text-sm transition">
                Sign in to Studio →
              </Link>
            )}
          </div>
          <Link href="/courses" className="text-slate-500 hover:text-white text-sm transition">
            View Course Catalog
          </Link>
        </div>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
