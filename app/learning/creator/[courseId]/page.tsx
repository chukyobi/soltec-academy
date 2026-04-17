import { Play, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PaystackButtonWrapper from "./PaystackWrapper";

export default async function CreatorCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await prisma.creatorCourse.findUnique({
    where: { id: params.courseId },
    include: {
      creator: { select: { name: true, email: true } },
      videos: { orderBy: { order: "asc" } },
    },
  });

  if (!course) notFound();

  const freeVideos = course.videos.filter(v => v.isFree);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-8"
        >
          ← Back to catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {course.title}
              </h1>
              <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                Created by{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {course.creator.name ?? course.creator.email}
                </span>
              </p>

              <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                {course.description}
              </p>

              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4" /> {course.videos.length} Lectures
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {freeVideos.length} free previews
                </span>
              </div>

              {course.videos.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 pb-2 mb-4 dark:border-gray-800">
                    Course Outline
                  </h2>
                  <ul className="space-y-3">
                    {course.videos.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          {v.isFree ? (
                            <Play className="w-5 h-5 text-indigo-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {v.order}. {v.title}
                            </span>
                            {v.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{v.description}</p>
                            )}
                          </div>
                          {v.isFree && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              Free
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Col — Purchase */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 sticky top-8 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-700 relative flex items-center justify-center">
                <Play className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6 space-y-6">
                <div className="text-4xl font-black text-gray-900 dark:text-white">
                  ${course.price.toFixed(2)}
                </div>

                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Full Lifetime Access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> {course.videos.length} lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Certificate of Completion
                  </li>
                </ul>

                <PaystackButtonWrapper
                  amount={course.price}
                  email="student@example.com"
                  courseId={course.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
