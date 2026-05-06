import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ cohortId: string }> }) {
  try {
    const { cohortId } = await params;
    const studentSession = await getSession("student").catch(() => null);
    const tutorSession = await getSession("tutor").catch(() => null);
    const session = (studentSession || tutorSession) as any;

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const room = `classroom-${cohortId}`;
    const participantName = session.user.name || "Anonymous";
    const participantIdentity = session.userId;

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantIdentity,
        name: participantName,
      }
    );

    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
