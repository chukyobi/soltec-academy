import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COURSES = [
  {
    title: "Product Design",
    slug: "product-design",
    description:
      "Learn to design beautiful, user-centred digital products from scratch. Master Figma, design systems, prototyping, and how to deliver polished work that product teams love.",
    level: "Beginner to Intermediate",
    duration: "3 Months",
    price: "NGN 120,000",
    color: "from-rose-500 via-pink-500 to-fuchsia-600",
    isProgramming: false,
    instructorName: "Tunde Bello",
    instructorRole: "Senior Product Designer",
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design",
    description:
      "Deep-dive into user experience thinking, interaction design, and modern UI principles. Build a portfolio of real-world projects that gets you hired.",
    level: "Beginner",
    duration: "3 Months",
    price: "NGN 110,000",
    color: "from-violet-600 via-purple-600 to-indigo-600",
    isProgramming: false,
    instructorName: "Zara Ahmed",
    instructorRole: "UX Lead at Fintech",
  },
  {
    title: "Data Analysis",
    slug: "data-analysis",
    description:
      "Turn raw data into insights that drive decisions. Master Excel, SQL, Python basics, and data visualisation — no prior coding experience needed.",
    level: "Beginner",
    duration: "3 Months",
    price: "NGN 100,000",
    color: "from-amber-500 via-orange-500 to-red-500",
    isProgramming: false,
    instructorName: "Kemi Adeyemi",
    instructorRole: "Data Analyst",
  },
  {
    title: "Frontend Web Dev",
    slug: "frontend-web-dev",
    description:
      "Go from zero to building real, deployable web apps. Learn HTML, CSS, JavaScript, React, and everything you need to ship polished front-end code.",
    level: "Beginner",
    duration: "3 Months",
    price: "NGN 130,000",
    color: "from-cyan-500 via-sky-500 to-blue-600",
    isProgramming: true,
    instructorName: "Emeka Eze",
    instructorRole: "Senior Frontend Engineer",
  },
  {
    title: "Backend Web Dev",
    slug: "backend-web-dev",
    description:
      "Build the services, APIs, and databases that power modern applications. Learn Node.js, Express, PostgreSQL, authentication, and cloud deployment.",
    level: "Beginner to Intermediate",
    duration: "3 Months",
    price: "NGN 140,000",
    color: "from-emerald-500 via-teal-500 to-green-600",
    isProgramming: true,
    instructorName: "Chukwudi Okonkwo",
    instructorRole: "Backend Engineer",
  },
];

async function main() {
  console.log("🌱 Seeding academy courses...");

  for (const course of COURSES) {
    const existing = await prisma.academyCourse.findUnique({ where: { slug: course.slug } });
    if (existing) {
      console.log(`  ⏭  Skipping "${course.title}" (already exists)`);
      continue;
    }

    await prisma.academyCourse.create({ data: course });
    console.log(`  ✅ Created "${course.title}"`);
  }

  console.log("✅ Done seeding academy courses.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
