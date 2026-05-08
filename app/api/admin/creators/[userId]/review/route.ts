import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const session = await getSession("admin").catch(() => null) as any;
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, reason } = await req.json();

    const updated = await prisma.creatorProfile.update({
      where: { userId },
      data: { 
        approvalStatus: status,
        rejectionReason: reason,
        isVerified: status === "APPROVED"
      },
      include: { user: true }
    });

    // TODO: Send email to creator about the decision
    // sendCreatorStatusEmail(updated.user.email, status, reason);

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    return serverError(err, "POST creator review");
  }
}
