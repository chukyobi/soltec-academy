import { Video, MessagesSquare, FileCode2, Share2, MonitorUp, Send } from "lucide-react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function CohortClassroomPage({
  params,
}: {
  params: { cohortId: string };
}) {
  const cohort = await prisma.cohort.findUnique({
    where: { id: params.cohortId },
    include: {
      course: { select: { title: true } },
      assignments: {
        include: {
          submissions: { select: { id: true } },
        },
        orderBy: { id: "asc" },
      },
      enrollments: { select: { id: true } },
    },
  });

  if (!cohort) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{cohort.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tutor: {cohort.tutorName ?? "TBA"} • {cohort.course.title} •{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {cohort.enrollments.length} student{cohort.enrollments.length !== 1 ? "s" : ""} enrolled
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800">
            <MonitorUp className="w-4 h-4" />
            Request Screen Control
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            <Video className="w-4 h-4" />
            Join Live Class
          </button>
        </div>
      </header>

      {/* Main Board */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Whiteboard + Assignments */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Whiteboard */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex-1 relative min-h-[400px] overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] bg-white dark:bg-gray-900">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-3 py-1 bg-white dark:bg-gray-800 shadow rounded border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Live Whiteboard Active
                </div>
              </div>
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Share2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    Waiting for tutor to start drawing…
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FileCode2 className="w-5 h-5 text-indigo-500" /> Digital Assignments
            </h2>

            {cohort.assignments.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No assignments posted yet. Check back soon.
              </p>
            ) : (
              <ul className="space-y-3 mb-6">
                {cohort.assignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{a.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{a.description}</p>
                    </div>
                    <span className="ml-4 shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                      {a.submissions.length} submitted
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Upload zone */}
            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Drag and drop your assignment folder (.zip) here
              </p>
              <button className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm font-medium shadow-sm">
                Browse Files
              </button>
            </div>
          </div>
        </div>

        {/* Right — Community Chat */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col pt-4">
          <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessagesSquare className="w-5 h-5 text-blue-500" /> Cohort Chat
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {cohort.tutorName ?? "Tutor"} (Tutor)
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Welcome to {cohort.name}! Our first live session starts soon.
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900 ml-6">
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">You</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">Looking forward to it!</p>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex rounded-lg shadow-sm">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-l-md focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2 border"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
