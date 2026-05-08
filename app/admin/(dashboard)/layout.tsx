import Link from "next/link";
import {
  LayoutDashboard, FileText, Video, Users,
  Shield, Bell, ChevronRight, Sparkles, GraduationCap, Menu, X
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin",          label: "Dashboard",         icon: LayoutDashboard },
  { href: "/admin/academy",  label: "Academy",           icon: GraduationCap },
  { href: "/admin/courses",  label: "Creator Courses",   icon: Video },
  { href: "/admin/blog",     label: "Blog Posts",        icon: FileText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession("admin").catch(() => null);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#06060a]">
      {/* ── Mobile Nav Toggle ── */}
      <input type="checkbox" id="admin-sidebar-toggle" className="hidden peer" />
      
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0d0d14] border-r border-white/5 flex flex-col transition-transform -translate-x-full peer-checked:translate-x-0 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shrink-0">
        {/* Logo */}
        <div className="p-8 border-b border-white/5">
          <Link href="/admin">
            <img src="/soltec-academy-logo.svg" alt="Soltec Academy" className="h-8 w-auto brightness-200" />
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Admin Portal</p>
          </Link>
        </div>

        {/* Admin info */}
        <div className="mx-4 mt-6 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-red-500/20">
            {(session.user.name ?? "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-black truncate uppercase tracking-tighter">{session.user.name ?? "Admin"}</p>
            <p className="text-red-500 text-[9px] font-black uppercase tracking-widest">Administrator</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-1">
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-4">Management</p>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-black uppercase tracking-widest">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link href="/studio" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Creator Studio</span>
          </Link>
          <div className="pt-4">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ── Overlay for Mobile Sidebar ── */}
      <label htmlFor="admin-sidebar-toggle" className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto lg:hidden" />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-[#06060a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <label htmlFor="admin-sidebar-toggle" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white cursor-pointer">
            <Menu className="w-6 h-6" />
          </label>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white font-black text-[10px] uppercase tracking-widest">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-slate-500 text-[9px] font-black uppercase">Live Updates</p>
            </div>
            <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white font-black text-xs">
              {(session.user.name ?? "A")[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
