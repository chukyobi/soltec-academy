import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    
    // 1. Fetch cohort and settings
    const cohort = await (prisma.cohort as any).findUnique({
      where: { id: cohortId },
      include: { settings: true }
    });
    if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    const threshold = cohort.settings?.passThreshold ?? 70;

    // 2. Fetch all enrollments
    const enrollments = await prisma.cohortEnrollment.findMany({
      where: { cohortId },
      include: { user: { select: { id: true, name: true } } }
    });

    // 3. Fetch all data for scoring
    const assignments = await (prisma.assignment as any).findMany({
      where: { cohortId },
      include: { submissions: true }
    });
    const attendanceSessions = await (prisma as any).attendanceSession.findMany({
      where: { cohortId, closedAt: { not: null } },
      include: { records: true }
    });

    // 4. Calculate scores
    const studentScores = enrollments.map(e => {
      const userId = e.userId;
      
      // Assignment Score
      const userSubmissions = assignments.flatMap((a: any) => a.submissions.filter((s: any) => s.userId === userId));
      let avgAssignmentScore = 0;
      if (assignments.length > 0) {
        const total = userSubmissions.reduce((sum: number, s: any) => {
          const assignment = assignments.find((a: any) => a.id === s.assignmentId);
          return sum + (s.score / (assignment?.maxScore ?? 100));
        }, 0);
        avgAssignmentScore = (total / assignments.length) * 100;
      }

      // Attendance Score
      const attendedCount = attendanceSessions.filter((s: any) => s.records.some((r: any) => r.userId === userId)).length;
      const attendanceScore = attendanceSessions.length > 0 ? (attendedCount / attendanceSessions.length) * 100 : 100;

      // Participation (Flat 5 for now, can be weighted)
      const participationScore = 100;

      const finalScore = (avgAssignmentScore * 0.5) + (attendanceScore * 0.3) + (participationScore * 0.2);
      
      // ELIGIBILITY: Must be above threshold to get the Trophy
      const isEligible = finalScore >= threshold && avgAssignmentScore > 0;

      return { userId, finalScore, isEligible };
    });

    // 5. Filter for eligible and sort
    const top3 = studentScores
      .filter(s => s.isEligible)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 3)
      .map(s => s.userId);

    return NextResponse.json(top3);
  } catch (err) {
    return serverError(err, "GET top students");
  }
}
