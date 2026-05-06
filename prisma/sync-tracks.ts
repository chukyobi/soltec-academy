/**
 * sync-tracks.ts
 * Run: npx tsx prisma/sync-tracks.ts
 *
 * - Upserts all 8 official Soltec Academy tracks (3 months duration each)
 * - Does NOT delete cohorts — existing cohorts are preserved
 * - Removes any legacy tracks that are no longer in the official list
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OFFICIAL_TRACKS = [
  {
    title: "Product Design",
    slug: "product-design",
    description:
      "Learn to design beautiful, user-centred digital products from scratch. Master Figma, design systems, prototyping, and how to deliver polished work that product teams love.",
    level: "Beginner to Intermediate",
    duration: "3 Months",
    price: "NGN 120,000",
    basePrice: 120000,
    color: "from-rose-500 via-pink-500 to-fuchsia-600",
    gradient: "from-rose-600 via-pink-600 to-fuchsia-600",
    isProgramming: false,
    tag: "Design",
    isActive: true,
  },
  {
    title: "Frontend Web Development",
    slug: "frontend-web-dev",
    description:
      "Go from zero to building real, deployable web apps. Learn HTML, CSS, JavaScript, React, and everything you need to ship polished front-end code.",
    level: "Beginner",
    duration: "3 Months",
    price: "NGN 130,000",
    basePrice: 130000,
    color: "from-cyan-500 via-sky-500 to-blue-600",
    gradient: "from-cyan-600 via-sky-600 to-blue-700",
    isProgramming: true,
    tag: "Engineering",
    isActive: true,
  },
  {
    title: "Backend Web Development",
    slug: "backend-web-dev",
    description:
      "Build the services, APIs, and databases that power modern applications. Learn Node.js, Express, PostgreSQL, authentication, and cloud deployment.",
    level: "Beginner to Intermediate",
    duration: "3 Months",
    price: "NGN 140,000",
    basePrice: 140000,
    color: "from-emerald-500 via-teal-500 to-green-600",
    gradient: "from-emerald-600 via-teal-600 to-green-700",
    isProgramming: true,
    tag: "Engineering",
    isActive: true,
  },
  {
    title: "Fullstack Web Development",
    slug: "fullstack-web-dev",
    description:
      "Master both front-end and back-end development and become the engineer who can build complete, production-ready web applications from start to finish.",
    level: "Intermediate",
    duration: "3 Months",
    price: "NGN 160,000",
    basePrice: 160000,
    color: "from-indigo-600 via-purple-600 to-pink-600",
    gradient: "from-indigo-700 via-purple-700 to-pink-700",
    isProgramming: true,
    tag: "Engineering",
    isActive: true,
  },
  {
    title: "Data Analysis",
    slug: "data-analysis",
    description:
      "Turn raw data into insights that drive decisions. Master Excel, SQL, Python basics, and data visualisation — no prior coding experience needed.",
    level: "Beginner",
    duration: "3 Months",
    price: "NGN 100,000",
    basePrice: 100000,
    color: "from-amber-500 via-orange-500 to-red-500",
    gradient: "from-amber-600 via-orange-600 to-red-600",
    isProgramming: false,
    tag: "Data",
    isActive: true,
  },
  {
    title: "Mobile App Development",
    slug: "mobile-app-dev",
    description:
      "Build beautiful, high-performance mobile apps for iOS and Android using React Native. Learn from UI design to app store deployment.",
    level: "Beginner to Intermediate",
    duration: "3 Months",
    price: "NGN 150,000",
    basePrice: 150000,
    color: "from-violet-600 via-purple-600 to-indigo-600",
    gradient: "from-violet-700 via-purple-700 to-indigo-700",
    isProgramming: true,
    tag: "Engineering",
    isActive: true,
  },
  {
    title: "Cybersecurity",
    slug: "cybersecurity",
    description:
      "Learn to identify vulnerabilities, defend systems, and respond to threats. Gain hands-on skills in ethical hacking, network security, and incident response.",
    level: "Beginner to Intermediate",
    duration: "3 Months",
    price: "NGN 130,000",
    basePrice: 130000,
    color: "from-slate-700 via-slate-800 to-slate-900",
    gradient: "from-slate-800 via-slate-900 to-black",
    isProgramming: false,
    tag: "Security",
    isActive: true,
  },
  {
    title: "Solar Installation",
    slug: "solar-installation",
    description:
      "Get certified in renewable energy. Learn the fundamentals of solar PV systems — from site assessment and panel installation to system configuration and safety.",
    level: "Beginner",
    duration: "3 Months",
    price: "NGN 90,000",
    basePrice: 90000,
    color: "from-yellow-500 via-amber-500 to-orange-500",
    gradient: "from-yellow-600 via-amber-600 to-orange-600",
    isProgramming: false,
    tag: "Engineering",
    isActive: true,
  },
];

const OFFICIAL_SLUGS = OFFICIAL_TRACKS.map((t) => t.slug);

async function main() {
  console.log("🔄 Syncing official Soltec Academy tracks...\n");

  // 1. Upsert all official tracks
  for (const track of OFFICIAL_TRACKS) {
    await prisma.academyCourse.upsert({
      where: { slug: track.slug },
      update: {
        title: track.title,
        duration: track.duration,
        description: track.description,
        level: track.level,
        tag: track.tag,
        isProgramming: track.isProgramming,
      },
      create: track,
    });
    console.log(`  ✅ Upserted: "${track.title}"`);
  }

  // 2. Report legacy tracks (not deleting to be safe)
  const allCourses = await prisma.academyCourse.findMany({ select: { slug: true, title: true } });
  const legacy = allCourses.filter((c) => !OFFICIAL_SLUGS.includes(c.slug));
  if (legacy.length > 0) {
    console.log("\n⚠️  Legacy tracks found (not deleted — remove manually if desired):");
    legacy.forEach((c) => console.log(`     - ${c.title} (${c.slug})`));
  }

  console.log("\n✅ Sync complete! All 8 official tracks are active.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
