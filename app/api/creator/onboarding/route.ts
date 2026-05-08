import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const session = await getSession("creator").catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { 
      bio, specialty, website, 
      legalFullName, idNumber, 
      bankName, accountNumber, accountName,
      agreedToTerms 
    } = data;

    if (!legalFullName || !idNumber || !bankName || !accountNumber || !agreedToTerms) {
      return NextResponse.json({ error: "Missing required legal/financial fields" }, { status: 400 });
    }

    // Upsert creator profile
    const profile = await prisma.creatorProfile.upsert({
      where: { userId: session.userId },
      update: {
        bio, specialty, website,
        legalFullName, idNumber,
        bankName, accountNumber, accountName,
        agreedToTerms,
        termsAcceptedAt: new Date(),
        approvalStatus: "PENDING" // Reset to pending if they update during onboarding
      },
      create: {
        userId: session.userId,
        bio, specialty, website,
        legalFullName, idNumber,
        bankName, accountNumber, accountName,
        agreedToTerms,
        termsAcceptedAt: new Date(),
        approvalStatus: "PENDING"
      }
    });

    // Notify Admin (optional, could be via Pusher or Email)
    // TODO: Send admin notification email

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    return serverError(err, "POST creator onboarding");
  }
}
