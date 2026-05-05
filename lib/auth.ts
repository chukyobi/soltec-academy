import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "./prisma";

const SECRET = process.env.SESSION_SECRET ?? "soltec-default-secret-change-in-prod";
export type Portal = "admin" | "student" | "tutor" | "creator";

const COOKIE_NAMES: Record<Portal, string> = {
  admin: "soltec_admin_session",
  student: "soltec_student_session",
  tutor: "soltec_tutor_session",
  creator: "soltec_creator_session",
};

const SESSION_TTL_DAYS = 7;

// ── Token helpers ─────────────────────────────────────────────────────────────

export function signToken(sessionId: string): string {
  const payload = Buffer.from(sessionId).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return Buffer.from(payload, "base64url").toString();
}

// ── Password helpers ───────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
}

// ── OTP helpers ────────────────────────────────────────────────────────────────

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ── Session management ─────────────────────────────────────────────────────────

export async function createSession(userId: string, portal: Portal = "student") {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000);

  await prisma.session.create({ data: { id: sessionId, userId, token: sessionId, expiresAt } });

  const cookieStore = await cookies();
  const cookieName = COOKIE_NAMES[portal];
  
  cookieStore.set(cookieName, signToken(sessionId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSession(portal: Portal = "student", req?: NextRequest) {
  const cookieName = COOKIE_NAMES[portal];
  let raw: string | undefined;

  if (req) {
    raw = req.cookies.get(cookieName)?.value;
  } else {
    const cookieStore = await cookies();
    raw = cookieStore.get(cookieName)?.value;
  }

  if (!raw) return null;

  const sessionId = verifyToken(raw);
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { include: { creatorProfile: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function deleteSession(portal: Portal = "student") {
  const cookieName = COOKIE_NAMES[portal];
  const cookieStore = await cookies();
  const raw = cookieStore.get(cookieName)?.value;
  if (raw) {
    const sessionId = verifyToken(raw);
    if (sessionId) {
      await prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {});
    }
  }
  cookieStore.delete(cookieName);
}

// ── Convenience: require session or throw ─────────────────────────────────────

export async function requireSession(portal: Portal = "student", req?: NextRequest) {
  const session = await getSession(portal, req);
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireCreator(req?: NextRequest) {
  const session = await requireSession("creator", req);
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireAdmin(req?: NextRequest) {
  const session = await requireSession("admin", req);
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

export async function requireTutor(req?: NextRequest) {
  const session = await requireSession("tutor", req);
  if (session.user.role !== "TUTOR" && session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

// Any authenticated user (student, creator, admin) can access student-facing APIs
export async function requireStudent(req?: NextRequest) {
  return requireSession("student", req);
}
