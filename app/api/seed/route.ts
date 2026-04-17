import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── PATCH: Comprehensive seed — courses + tutors + cohorts + enrollments ─────
export async function PATCH() {
  const COURSES = [
    {
      title: "Product Design",
      slug: "product-design",
      description: "Learn to design beautiful, user-centred digital products from scratch. Master Figma, design systems, prototyping, and how to deliver polished work that product teams love.",
      level: "Beginner to Intermediate",
      duration: "3 Months",
      price: "NGN 120,000",
      color: "from-rose-500 via-pink-500 to-fuchsia-600",
      isProgramming: false,
      instructorName: "Tunde Bello",
      instructorRole: "Senior Product Designer",
      modules: [
        { id: "m1", title: "Design Fundamentals", videos: [
          { id: "v1", title: "Introduction to Product Design", duration: "8:00", isFree: true },
          { id: "v2", title: "Typography & Color Theory", duration: "20:00", isFree: true },
          { id: "v3", title: "Grid Systems & Layout", duration: "18:00", isFree: false },
        ]},
        { id: "m2", title: "Figma Mastery", videos: [
          { id: "v4", title: "Figma Interface Walkthrough", duration: "15:00", isFree: false },
          { id: "v5", title: "Components & Auto Layout", duration: "25:00", isFree: false },
          { id: "v6", title: "Design Systems & Tokens", duration: "30:00", isFree: false },
        ]},
        { id: "m3", title: "User Research & Testing", videos: [
          { id: "v7", title: "User Interviews & Personas", duration: "22:00", isFree: false },
          { id: "v8", title: "Usability Testing", duration: "28:00", isFree: false },
          { id: "v9", title: "Capstone: End-to-End Product Case Study", duration: "60:00", isFree: false },
        ]},
      ],
    },
    {
      title: "UI/UX Design",
      slug: "ui-ux-design",
      description: "Deep-dive into user experience thinking, interaction design, and modern UI principles. Build a portfolio of real-world projects that gets you hired.",
      level: "Beginner",
      duration: "3 Months",
      price: "NGN 110,000",
      color: "from-violet-600 via-purple-600 to-indigo-600",
      isProgramming: false,
      instructorName: "Zara Ahmed",
      instructorRole: "UX Lead, Fintech",
      modules: [
        { id: "m1", title: "UX Foundations", videos: [
          { id: "v1", title: "What is UX Design?", duration: "10:00", isFree: true },
          { id: "v2", title: "UX Process & Heuristics", duration: "22:00", isFree: true },
          { id: "v3", title: "Empathy Maps & User Journeys", duration: "25:00", isFree: false },
        ]},
        { id: "m2", title: "Wireframing & Prototyping", videos: [
          { id: "v4", title: "Low-Fidelity Wireframes", duration: "18:00", isFree: false },
          { id: "v5", title: "High-Fidelity Prototypes", duration: "30:00", isFree: false },
          { id: "v6", title: "Interaction Design Patterns", duration: "28:00", isFree: false },
        ]},
        { id: "m3", title: "Portfolio & Career", videos: [
          { id: "v7", title: "Building a UX Case Study", duration: "35:00", isFree: false },
          { id: "v8", title: "Portfolio Presentation", duration: "20:00", isFree: false },
        ]},
      ],
    },
    {
      title: "Data Analysis",
      slug: "data-analysis",
      description: "Turn raw data into insights that drive business decisions. Master Excel, SQL, Python basics, and data visualisation — no prior coding experience needed.",
      level: "Beginner",
      duration: "3 Months",
      price: "NGN 100,000",
      color: "from-amber-500 via-orange-500 to-red-500",
      isProgramming: false,
      instructorName: "Kemi Adeyemi",
      instructorRole: "Data Analyst",
      modules: [
        { id: "m1", title: "Data Foundations", videos: [
          { id: "v1", title: "Welcome to Data Analysis", duration: "5:24", isFree: true },
          { id: "v2", title: "Data Types & Structures", duration: "12:10", isFree: true },
          { id: "v3", title: "Data Cleaning Techniques", duration: "20:00", isFree: false },
        ]},
        { id: "m2", title: "Tools & Querying", videos: [
          { id: "v4", title: "Excel Power Tools", duration: "30:00", isFree: false },
          { id: "v5", title: "SQL Fundamentals", duration: "35:00", isFree: false },
          { id: "v6", title: "Python for Data", duration: "40:00", isFree: false },
        ]},
        { id: "m3", title: "Visualisation & Storytelling", videos: [
          { id: "v7", title: "Charts & Dashboards", duration: "28:00", isFree: false },
          { id: "v8", title: "Data Storytelling", duration: "22:00", isFree: false },
          { id: "v9", title: "Capstone Project", duration: "60:00", isFree: false },
        ]},
      ],
    },
    {
      title: "Frontend Web Dev",
      slug: "frontend-web-dev",
      description: "Go from zero to building real, deployable web apps. Learn HTML, CSS, JavaScript, React, and everything you need to ship polished front-end code.",
      level: "Beginner",
      duration: "3 Months",
      price: "NGN 130,000",
      color: "from-cyan-500 via-sky-500 to-blue-600",
      isProgramming: true,
      instructorName: "Emeka Eze",
      instructorRole: "Senior Frontend Engineer",
      modules: [
        { id: "m1", title: "HTML & CSS", videos: [
          { id: "v1", title: "HTML Skeleton", duration: "10:00", isFree: true },
          { id: "v2", title: "CSS Styling & Box Model", duration: "15:00", isFree: true },
          { id: "v3", title: "Flexbox & Grid", duration: "20:00", isFree: false },
        ]},
        { id: "m2", title: "JavaScript", videos: [
          { id: "v4", title: "Variables, Types & Functions", duration: "22:00", isFree: false },
          { id: "v5", title: "DOM Manipulation", duration: "35:00", isFree: false },
          { id: "v6", title: "Async JS & Fetch API", duration: "30:00", isFree: false },
        ]},
        { id: "m3", title: "React & Deploy", videos: [
          { id: "v7", title: "Components & Props", duration: "25:00", isFree: false },
          { id: "v8", title: "State & useEffect", duration: "30:00", isFree: false },
          { id: "v9", title: "Git, GitHub & Deploy", duration: "20:00", isFree: false },
        ]},
      ],
    },
    {
      title: "Backend Web Dev",
      slug: "backend-web-dev",
      description: "Build the services, APIs, and databases that power modern applications. Learn Node.js, Express, PostgreSQL, authentication, and cloud deployment.",
      level: "Beginner to Intermediate",
      duration: "3 Months",
      price: "NGN 140,000",
      color: "from-emerald-500 via-teal-500 to-green-600",
      isProgramming: true,
      instructorName: "Chukwudi Okonkwo",
      instructorRole: "Backend Engineer",
      modules: [
        { id: "m1", title: "Server Foundations", videos: [
          { id: "v1", title: "Intro to Node.js", duration: "12:00", isFree: true },
          { id: "v2", title: "Express.js Basics", duration: "25:00", isFree: true },
          { id: "v3", title: "REST API Design", duration: "30:00", isFree: false },
        ]},
        { id: "m2", title: "Databases", videos: [
          { id: "v4", title: "SQL vs NoSQL", duration: "20:00", isFree: false },
          { id: "v5", title: "PostgreSQL with Prisma", duration: "40:00", isFree: false },
          { id: "v6", title: "Build a Full CRUD API", duration: "45:00", isFree: false },
        ]},
        { id: "m3", title: "Auth & Security", videos: [
          { id: "v7", title: "JWT & Sessions", duration: "28:00", isFree: false },
          { id: "v8", title: "Password Hashing & Roles", duration: "22:00", isFree: false },
          { id: "v9", title: "Cloud Deploy & Capstone", duration: "50:00", isFree: false },
        ]},
      ],
    },
  ];

  const results: string[] = [];

  // ── 1. Upsert courses ────────────────────────────────────────────────────
  const courseMap: Record<string, string> = {};
  for (const course of COURSES) {
    const { modules, ...courseData } = course;
    const upserted = await prisma.academyCourse.upsert({
      where: { slug: course.slug },
      update: { ...courseData, modules },
      create: { ...courseData, modules },
    });
    courseMap[course.slug] = upserted.id;
    results.push(`upserted: ${course.title}`);
  }

  // ── 2. Upsert tutors with known passwords ────────────────────────────────
  const { hashPassword } = await import("@/lib/auth");
  const tutorPass = hashPassword("Tutor@1234");

  const tutor1 = await prisma.user.upsert({
    where: { email: "tunde.bello@soltec.ng" },
    update: { name: "Tunde Bello", role: "TUTOR", emailVerified: true, password: tutorPass },
    create: { email: "tunde.bello@soltec.ng", name: "Tunde Bello", role: "TUTOR", password: tutorPass, emailVerified: true },
  });
  const tutor2 = await prisma.user.upsert({
    where: { email: "zara.ahmed@soltec.ng" },
    update: { name: "Zara Ahmed", role: "TUTOR", emailVerified: true, password: tutorPass },
    create: { email: "zara.ahmed@soltec.ng", name: "Zara Ahmed", role: "TUTOR", password: tutorPass, emailVerified: true },
  });
  const tutor3 = await prisma.user.upsert({
    where: { email: "emeka.eze@soltec.ng" },
    update: { name: "Emeka Eze", role: "TUTOR", emailVerified: true, password: tutorPass },
    create: { email: "emeka.eze@soltec.ng", name: "Emeka Eze", role: "TUTOR", password: tutorPass, emailVerified: true },
  });
  results.push("tutors → email: tunde.bello@soltec.ng | zara.ahmed@soltec.ng | emeka.eze@soltec.ng, pw: Tutor@1234");

  // ── 3. Upsert test students with known passwords ─────────────────────────
  const studentPass = hashPassword("Student@1234");
  const student1 = await prisma.user.upsert({
    where: { email: "emeka.obi@student.ng" },
    update: { name: "Emeka Obi", emailVerified: true, password: studentPass },
    create: { email: "emeka.obi@student.ng", name: "Emeka Obi", role: "STUDENT", password: studentPass, emailVerified: true },
  });
  const student2 = await prisma.user.upsert({
    where: { email: "aisha.bello@student.ng" },
    update: { name: "Aisha Bello", emailVerified: true, password: studentPass },
    create: { email: "aisha.bello@student.ng", name: "Aisha Bello", role: "STUDENT", password: studentPass, emailVerified: true },
  });
  results.push("students → emeka.obi@student.ng / aisha.bello@student.ng, pw: Student@1234");

  // ── 4. Rebuild cohorts from scratch ─────────────────────────────────────
  await prisma.assignmentSubmission.deleteMany();
  await prisma.cohortEnrollment.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.cohort.deleteMany();

  const now = new Date();
  const mo = (offset: number) => now.getMonth() + offset;
  const yr = now.getFullYear();

  // ACTIVE — already started, not yet ended
  const activePD = await prisma.cohort.create({
    data: {
      name: "Product Design — Cohort 3",
      courseId: courseMap["product-design"],
      tutorId: tutor1.id, tutorName: tutor1.name,
      startDate: new Date(yr, mo(-1), 15),
      endDate:   new Date(yr, mo(+2), 14),
      maxStudents: 20, price: 120000,
      partPaymentEnabled: true, partPaymentPercent: 50,
    },
  });

  const activeUIUX = await prisma.cohort.create({
    data: {
      name: "UI/UX Design — Cohort 2",
      courseId: courseMap["ui-ux-design"],
      tutorId: tutor2.id, tutorName: tutor2.name,
      startDate: new Date(yr, mo(-2), 1),
      endDate:   new Date(yr, mo(+1), 28),
      maxStudents: 15, price: 110000,
      partPaymentEnabled: true, partPaymentPercent: 50,
    },
  });

  // UPCOMING — not yet started
  const upDA = await prisma.cohort.create({
    data: {
      name: "Data Analysis — Cohort 4",
      courseId: courseMap["data-analysis"],
      startDate: new Date(yr, mo(+1), 7),
      endDate:   new Date(yr, mo(+4), 6),
      maxStudents: 20, price: 100000,
      partPaymentEnabled: true, partPaymentPercent: 50,
    },
  });

  const upFE = await prisma.cohort.create({
    data: {
      name: "Frontend Dev — Cohort 5",
      courseId: courseMap["frontend-web-dev"],
      tutorId: tutor3.id, tutorName: tutor3.name,
      startDate: new Date(yr, mo(+2), 1),
      endDate:   new Date(yr, mo(+5), 1),
      maxStudents: 20, price: 130000,
      partPaymentEnabled: true, partPaymentPercent: 50,
    },
  });

  const upBE = await prisma.cohort.create({
    data: {
      name: "Backend Dev — Cohort 3",
      courseId: courseMap["backend-web-dev"],
      startDate: new Date(yr, mo(+2), 15),
      endDate:   new Date(yr, mo(+5), 14),
      maxStudents: 20, price: 140000,
      partPaymentEnabled: true, partPaymentPercent: 50,
    },
  });

  results.push(`active: [${activePD.name}] [${activeUIUX.name}]`);
  results.push(`upcoming: [${upDA.name}] [${upFE.name}] [${upBE.name}]`);

  // ── 5. Enroll test students in active cohorts ────────────────────────────
  await prisma.cohortEnrollment.createMany({
    data: [
      { userId: student1.id, cohortId: activePD.id, totalAmount: activePD.price, amountPaid: activePD.price, paymentStatus: "PAID", reference: `seed_pd_s1_${Date.now()}` },
      { userId: student2.id, cohortId: activePD.id, totalAmount: activePD.price, amountPaid: activePD.price * 0.5, paymentStatus: "PARTIAL", reference: `seed_pd_s2_${Date.now() + 1}` },
      { userId: student1.id, cohortId: activeUIUX.id, totalAmount: activeUIUX.price, amountPaid: activeUIUX.price, paymentStatus: "PAID", reference: `seed_uiux_s1_${Date.now() + 2}` },
    ],
    skipDuplicates: true,
  });
  results.push("enrollments: Emeka=PAID in PD+UIUX | Aisha=PARTIAL in PD");

  // ── 6. Sample assignment ─────────────────────────────────────────────────
  await prisma.assignment.create({
    data: {
      title: "Week 1 — Design Critique",
      description: "Submit a Figma link to your redesign of any popular Nigerian app screen. Annotate your design decisions clearly.",
      cohortId: activePD.id,
    },
  });
  results.push("seeded 1 assignment in Product Design Cohort 3");

  return NextResponse.json({ ok: true, results });
}

// ── GET: Full reset (dev only) ─────────────────────────────────────────────
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden in production" }, { status: 403 });
  }

  await prisma.videoProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.cohortEnrollment.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.academyCourse.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.courseVideo.deleteMany();
  await prisma.creatorCourse.deleteMany();
  await prisma.draftVideo.deleteMany();
  await prisma.courseDraft.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.blogPost.deleteMany();

  return NextResponse.json({ ok: true, message: "Content tables cleared. Run PATCH /api/seed to re-seed." });
}
