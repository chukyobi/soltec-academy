import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";
import crypto from "crypto";

// GET /api/admin/tutors – list all tutors
export async function GET() {
  try {
    await requireAdmin();
    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // cohorts assigned via cohort.tutorId
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with cohort count
    const enriched = await Promise.all(
      tutors.map(async (t) => {
        const cohortCount = await prisma.cohort.count({ where: { tutorId: t.id } });
        return { ...t, cohortCount };
      })
    );

    return NextResponse.json(enriched);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/tutors – create a tutor account
// Body: { name, email } — password is auto-generated
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    // Generate a memorable temporary password: word + 4 digits
    const words = ["Sky", "Star", "Wave", "Peak", "Blaze", "Swift", "Spark", "Bolt"];
    const word = words[Math.floor(Math.random() * words.length)];
    const digits = crypto.randomInt(1000, 9999).toString();
    const plainPassword = `${word}${digits}!`;

    const hashed = hashPassword(plainPassword);

    const tutor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "TUTOR",
        emailVerified: true, // admins pre-verify tutor accounts
      },
    });

    // Return the plain password ONCE so admin can share it
    return NextResponse.json({
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      role: tutor.role,
      temporaryPassword: plainPassword, // shown once only
    }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN")
      return NextResponse.json({ error: msg }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
