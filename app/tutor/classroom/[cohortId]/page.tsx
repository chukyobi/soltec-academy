import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  ArrowLeft, Users, ClipboardList, CheckCircle2,
  Clock, AlertCircle, BookOpen, Award, MessageSquare,
  BarChart2, UserCheck, FileCheck2, Send
} from "lucide-react";
import TutorClassroomClient from "./TutorClassroomClient";

export const revalidate = 0;

function fmtDate(d: Date | null) {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TutorClassroomPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const session = await getSession().catch(() => null);
  if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
    redirect("/tutor/login");
  }

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      course: true,
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true, createdAt: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      assignments: {
        include: {
          submissions: {
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { assignmentId: "asc" },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!cohort) notFound();

  // Tutors can only see their own cohorts (admins can see all)
  if (session.user.role === "TUTOR" && cohort.tutorId !== session.user.id) {
    redirect("/tutor/dashboard");
  }

  const modules = Array.isArray(cohort.course.modules)
    ? (cohort.course.modules as { id: string; title: string; videos: { id: string; title: string; duration: string; isFree: boolean }[] }[])
    : [];

  const totalLessons = modules.reduce((sum, m) => sum + m.videos.length, 0);
  const paidFull = cohort.enrollments.filter(e => e.paymentStatus === "PAID").length;
  const paidPart = cohort.enrollments.filter(e => e.paymentStatus === "PARTIAL").length;

  const serialCohort = {
    id: cohort.id,
    name: cohort.name,
    maxStudents: cohort.maxStudents,
    course: {
      title: cohort.course.title,
      slug: cohort.course.slug,
      color: cohort.course.color,
    },
    enrollments: cohort.enrollments.map(e => ({
      id: e.id,
      name: e.user.name,
      email: e.user.email,
      createdAt: e.createdAt.toISOString(),
      paymentStatus: e.paymentStatus as string,
      amountPaid: e.amountPaid,
      totalAmount: e.totalAmount,
    })),
    assignments: cohort.assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      submissions: a.submissions.map(s => ({
        id: s.id,
        fileUrl: s.fileUrl,
        grade: s.grade,
        user: { id: s.user.id, name: s.user.name, email: s.user.email },
      })),
    })),
  };

  return (
    <div className="min-h-screen bg-[#09090f]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#09090f]/80 backdrop-blur border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tutor/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-white font-black text-sm leading-tight">{cohort.name}</p>
              <p className="text-slate-500 text-xs">{cohort.course.title} · {fmtDate(cohort.startDate)} → {fmtDate(cohort.endDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Classroom
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Students", value: cohort.enrollments.length, icon: Users, color: "text-indigo-400" },
            { label: "Paid Full", value: paidFull, icon: CheckCircle2, color: "text-green-400" },
            { label: "Part-Pay", value: paidPart, icon: AlertCircle, color: "text-amber-400" },
            { label: "Lessons", value: totalLessons, icon: BookOpen, color: "text-purple-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <div>
                <p className="text-white font-black text-xl">{value}</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main classroom tabs */}
        <TutorClassroomClient cohort={serialCohort} modules={modules} />
      </div>
    </div>
  );
}
