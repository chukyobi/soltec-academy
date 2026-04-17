import prisma from "@/lib/prisma";
import AdminCourseActions from "./AdminCourseActions";

export const revalidate = 0; // always fresh

export default async function AdminCoursesPage() {
  const [pendingCourses, allCourses, notifications] = await Promise.all([
    prisma.creatorCourse.findMany({
      where: { status: "PENDING" },
      include: { creator: true, videos: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.creatorCourse.findMany({
      where: { status: { not: "PENDING" } },
      include: {
        creator: { select: { name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    // Graceful: if Notification table doesn't exist yet in client, return []
    prisma.notification
      .findMany({
        where: { type: "NEW_COURSE", readAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
      .catch(() => [] as Awaited<ReturnType<typeof prisma.notification.findMany>>),
  ]);

  const STATUS_BADGE: Record<string, string> = {
    APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
    REJECTED:  "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Course Management</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live data
        </div>
      </div>

      {/* Unread notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n: (typeof notifications)[number]) => (
            <div key={n.id}
              className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <span className="text-amber-400 text-sm">🔔</span>
              <p className="text-amber-200 text-sm font-medium">{n.message}</p>
              <span className="text-amber-600 text-xs ml-auto shrink-0">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Pending Review ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold text-white">Pending Review</h3>
          {pendingCourses.length > 0 && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCourses.length}
            </span>
          )}
        </div>

        {pendingCourses.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-slate-500 text-sm">
            🎉 No courses pending review
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCourses.map((course: (typeof pendingCourses)[number]) => (
              <div key={course.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        ⏳ Pending
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-lg truncate">{course.title}</h4>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center flex-wrap gap-4 mt-3 text-xs text-slate-500">
                      <span>👤 {course.creator.name ?? course.creator.email}</span>
                      <span>💰 ${course.price.toFixed(2)}</span>
                      <span>🎬 {course.videos.length} video{course.videos.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <AdminCourseActions courseId={course.id} />
                </div>

                {course.videos.length > 0 && (
                  <div className="mt-4 border-t border-white/5 pt-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Course Content</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {course.videos.map((v: (typeof course.videos)[number]) => (
                        <div key={v.id} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="text-indigo-400 font-bold w-6 shrink-0">{v.order}.</span>
                          <span className="truncate flex-1">{v.title}</span>
                          {v.description && (
                            <span className="text-slate-600 truncate hidden sm:block max-w-[200px]">{v.description}</span>
                          )}
                          {v.isFree && (
                            <span className="text-green-400 shrink-0 font-bold">Free</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── All Courses Table ── */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">All Courses</h3>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Students</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {allCourses.map((c: (typeof allCourses)[number]) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  <td className="px-6 py-3.5 text-white font-medium">{c.title}</td>
                  <td className="px-6 py-3.5 text-slate-400 hidden md:table-cell">
                    {c.creator.name ?? c.creator.email}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">${c.price.toFixed(2)}</td>
                  <td className="px-6 py-3.5 text-slate-400 hidden sm:table-cell">{c._count.enrollments}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs font-bold border px-2.5 py-0.5 rounded-full ${STATUS_BADGE[c.status] ?? "text-slate-400 border-slate-700"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {allCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm">
                    No approved or rejected courses yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
