import Link from "next/link";
import {
  LayoutDashboard, FileText, Video, Users,
  Shield, Bell, ChevronRight, Sparkles, GraduationCap
} from "lucide-react";
import { getSession } from "@/lib/auth";

const NAV = [
  { href: "/admin",          label: "Dashboard",         icon: LayoutDashboard },
  { href: "/admin/academy",  label: "Academy",           icon: GraduationCap },
  { href: "/admin/courses",  label: "Creator Courses",   icon: Video },
  { href: "/admin/blog",     label: "Blog Posts",        icon: FileText },
];


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null);

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-white/5 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Soltec Admin</p>
              <p className="text-slate-500 text-xs">Super Portal</p>
            </div>
          </Link>
        </div>

        {/* Admin badge */}
        {session && (
          <div className="mx-4 mt-4 bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(session.user.name ?? session.user.email ?? "A")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">{session.user.name ?? "Admin"}</p>
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">Navigation</p>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-0.5">
          <Link href="/studio" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Creator Studio</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-white font-bold text-sm">Admin Portal</h1>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs hidden sm:block">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-500/20">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
