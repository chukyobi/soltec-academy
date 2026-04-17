import { DollarSign, Eye, ShoppingCart } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function StudioDashboard() {
  // TODO: scope to logged-in creator — for now show aggregate across all creators
  const [revenueData, totalStudents, recentSales] = await Promise.all([
    prisma.purchase.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.purchase.groupBy({ by: ["userId"], _count: true }).then((g) => g.length),
    prisma.purchase.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { title: true } },
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  const totalRevenue = revenueData._sum.amount ?? 0;
  const coursesSold = revenueData._count;

  const stats = [
    {
      name: "Total Revenue",
      stat: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
    },
    { name: "Total Students", stat: totalStudents.toLocaleString(), icon: Eye },
    { name: "Courses Sold", stat: coursesSold.toLocaleString(), icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Studio Overview</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 border border-gray-200 dark:border-gray-800"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
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

      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Recent Sales</h3>
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg px-4 py-5 sm:p-6 border border-gray-200 dark:border-gray-800">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {recentSales.length === 0 ? (
              <li className="py-6 text-center text-gray-400">No sales yet.</li>
            ) : (
              recentSales.map((sale) => (
                <li key={sale.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sale.course.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sale.user.name ?? sale.user.email}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +${sale.amount.toFixed(2)}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
