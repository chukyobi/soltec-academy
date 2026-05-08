"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown, Shield, Bell, HelpCircle } from "lucide-react";

interface UserMenuProps {
  user: {
    name: string | null;
    email: string;
    image?: string | null;
  };
  role: "student" | "tutor" | "admin";
}

export function UserMenu({ user, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const res = await fetch(`/api/${role}/auth/logout`, { method: "POST" });
    if (res.ok) {
      window.location.href = role === "admin" ? "/admin" : `/${role}/login`;
    }
  };

  const profileUrl = `/${role}/profile`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 group"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
          {user.image ? (
            <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-indigo-400" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[11px] font-black text-white uppercase tracking-widest truncate max-w-[100px]">
            {user.name || "Member"}
          </p>
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-[#0d0d14] border border-white/10 rounded-[24px] shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-5 py-3 border-b border-white/5 mb-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Signed in as</p>
            <p className="text-sm font-bold text-white truncate">{user.email}</p>
          </div>

          <div className="px-2 space-y-1">
            <Link
              href={profileUrl}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
            >
              <User className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              <span className="text-xs font-bold tracking-wide">My Profile</span>
            </Link>
            
            <Link
              href={`${profileUrl}/settings`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
            >
              <Settings className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              <span className="text-xs font-bold tracking-wide">Account Settings</span>
            </Link>

            <Link
              href="/support"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
            >
              <HelpCircle className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              <span className="text-xs font-bold tracking-wide">Help & Support</span>
            </Link>
          </div>

          <div className="mt-2 pt-2 border-t border-white/5 px-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
