import { redirect } from "next/navigation";

export default async function LegacyClassroomPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  // Redirect to the new unified student classroom
  redirect(`/student/classroom/${cohortId}`);
}
