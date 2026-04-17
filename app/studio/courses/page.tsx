import prisma from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Clock, CheckCircle } from "lucide-react";

type StudioCourseRow = Awaited<
  ReturnType<typeof prisma.creatorCourse.findMany<{
    include: { _count: { select: { purchases: true } } };
  }>>
>[number];

export default async function StudioCoursesPage() {
  // Let's assume the user is known, but for our mock we will just fetch all Creator Courses
  // that were created by the dummy user we created in the API route, or just ALL creator courses.
  const courses = await prisma.creatorCourse.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { purchases: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Courses</h2>
        <Link href="/studio/upload" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
          <PlusCircle className="h-5 w-5" />
          Upload New
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't uploaded any courses yet.</p>
          <Link href="/studio/upload" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Upload your first course
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex-1">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-950">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Upload Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {courses.map((course: StudioCourseRow) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <Link href={`/learning/creator/${course.id}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                      {course.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    {course.status === 'APPROVED' ? (
                      <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> Approved</span>
                    ) : course.status === 'PENDING' ? (
                      <span className="flex items-center text-yellow-600"><Clock className="w-4 h-4 mr-1" /> Awaiting</span>
                    ) : (
                      <span className="text-red-500">Rejected</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${course.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course._count.purchases}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
