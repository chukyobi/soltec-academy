import Link from "next/link";
import {
  Users, Video, DollarSign, FileText, GraduationCap,
  Layers, BarChart2, Code2, Database, MonitorSmartphone,
  BookOpen, ChevronRight, Users2
} from "lucide-react";
import prisma from "@/lib/prisma";

const SLUG_ICONS: Record<string, React.ElementType> = {
  "product-design": Layers,
  "ui-ux-design": MonitorSmartphone,
  "data-analysis": BarChart2,
  "frontend-web-dev": Code2,
  "backend-web-dev": Database,
};

export default async function AdminDashboardPage() {
  const [revenue, students, creatorCourses, blogPosts, academyTracks] =
    await Promise.all([
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.cohortEnrollment.count(),
      prisma.creatorCourse.count(),
      prisma.blogPost.count(),
      prisma.academyCourse.findMany({
        orderBy: { title: "asc" },
        include: { _count: { select: { cohorts: true } } },
      }),
    ]);

  const totalRevenue = revenue._sum.amount ?? 0;

  const stats = [
    {
      name: "Total Revenue",
      stat: `$${totalRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      name: "Active Cohort Students",
      stat: students.toLocaleString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Creator Courses",
      stat: creatorCourses.toLocaleString(),
      icon: Video,
      color: "bg-purple-500",
    },
    {
      name: "Blog Posts",
      stat: blogPosts.toLocaleString(),
      icon: FileText,
      color: "bg-amber-500",
    },
    {
      name: "Academy Tracks",
      stat: academyTracks.length.toLocaleString(),
      icon: GraduationCap,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-100">
          Dashboard
        </h2>
        <span className="text-slate-500 text-xs">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-slate-900 px-4 pt-5 pb-10 shadow border border-white/5 sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-xl ${item.color} p-3`}>
                <item.icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-400">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-4">
              <p className="text-2xl font-semibold text-gray-100">{item.stat}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* ── Academy Course Tracks ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-rose-400" />
              Academy Course Tracks
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              All tracks currently live in the database and shown on the public site.
            </p>
          </div>
          <Link
            href="/admin/academy"
            className="flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Manage tracks <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {academyTracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
            No academy tracks yet.{" "}
            <Link href="/admin/academy" className="text-indigo-400 underline">
              Create one
            </Link>
            .
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {academyTracks.map((track) => {
              const Icon = SLUG_ICONS[track.slug] ?? BookOpen;
              return (
                <div
                  key={track.id}
                  className="relative bg-slate-900 border border-white/5 rounded-2xl p-5 text-white shadow-lg group hover:border-white/10 transition-colors"
                >
                  {/* Level badge */}
                  <div className="absolute top-3 right-3 bg-black/20 text-white/80 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    {track.level}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Title */}
                  <h4 className="font-black text-base leading-tight mb-1">
                    {track.title}
                  </h4>

                  {/* Meta */}
                  <p className="text-white/60 text-xs mb-3">
                    {track.duration} · {track.price}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-white/70 border-t border-white/15 pt-3">
                    <span className="flex items-center gap-1">
                      <Users2 className="w-3 h-3" />
                      {track._count.cohorts}{" "}
                      {track._count.cohorts === 1 ? "cohort" : "cohorts"}
                    </span>
                    <Link
                      href={`/academy/${track.slug}`}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
