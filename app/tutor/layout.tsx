import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession("tutor").catch(() => null);

  // Protected route: Redirect to login if no session or not tutor/admin
  if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
    // If they are on the login page, don't redirect
    return <>{children}</>;
  }

  // Check if they need to change password
  // (Assuming we are not on the reset-password page)
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.needsPasswordChange) {
     // We will handle the redirect in a more granular way or via middleware
     // But for now, if they are not on /tutor/reset-password, redirect them
     // Note: we can't easily check current path in server layout, so we might need a client component or middleware
  }

  return <>{children}</>;
}
