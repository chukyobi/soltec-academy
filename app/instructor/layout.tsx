import Link from 'next/link';
import { BookOpen, Users, Settings, Plus, LayoutDashboard, ChevronLeft, Bell } from 'lucide-react';

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500/30">
            {/* Minimal App Header */}
            <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div className="flex flex-col">
                        <h2 className="font-black text-slate-900 tracking-tight leading-tight">Soltec Tutor Panel</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Instructor Dashboard</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-500 shadow-sm hover:shadow-md transition-shadow">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-900">Sarah Drasner</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lead Tutor</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30 ring-2 ring-white">
                            SD
                        </div>
                    </div>
                </div>
            </header>

            {/* Floating Island Navigation */}
            <div className="w-full flex justify-center sticky top-24 z-40 px-4 pointer-events-none">
                <nav className="bg-white/90 backdrop-blur-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full p-1.5 flex items-center gap-1 pointer-events-auto">
                    <Link href="/instructor" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-medium text-sm shadow-md transition-all">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/instructor" className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-gray-100 text-slate-600 font-medium text-sm transition-colors">
                        <BookOpen className="w-4 h-4 text-indigo-500" /> My Courses
                    </Link>
                    <Link href="/instructor" className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-gray-100 text-slate-600 font-medium text-sm transition-colors">
                        <Users className="w-4 h-4 text-emerald-500" /> Cohorts
                    </Link>
                    <Link href="/instructor" className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-gray-100 text-slate-600 font-medium text-sm transition-colors">
                        <Settings className="w-4 h-4 text-slate-400" /> Settings
                    </Link>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm ml-1">
                        <Plus className="w-5 h-5" />
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-12 mt-4 relative z-10">
                {children}
            </main>
        </div>
    );
}
