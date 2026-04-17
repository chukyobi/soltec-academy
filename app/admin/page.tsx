import { Users, Video, DollarSign, FileText } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [revenue, students, creatorCourses, blogPosts] = await Promise.all([
    prisma.purchase.aggregate({ _sum: { amount: true } }),
    prisma.cohortEnrollment.count(),
    prisma.creatorCourse.count(),
    prisma.blogPost.count(),
  ]);

  const totalRevenue = revenue._sum.amount ?? 0;

  const stats = [
    {
      name: "Total Revenue",
      stat: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
    },
    { name: "Active Cohort Students", stat: students.toLocaleString(), icon: Users },
    { name: "Creator Courses", stat: creatorCourses.toLocaleString(), icon: Video },
    { name: "Blog Posts", stat: blogPosts.toLocaleString(), icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 border border-gray-200 dark:border-gray-800"
          >
            <dt>
              <div className="absolute rounded-md bg-blue-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{item.stat}</p>
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
