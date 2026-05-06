import { NextResponse } from "next/server";

/**
 * Friendly messages for known Prisma error codes.
 * Technical details are always logged server-side; users never see stack traces or DB jargon.
 */
const PRISMA_USER_MESSAGES: Record<string, string> = {
  P2002: "That information is already taken. Please try a different value.",
  P2003: "This action references something that no longer exists.",
  P2025: "The record you're trying to update could not be found.",
  P2016: "Required data is missing. Please check your input and try again.",
  P1001: "We're having trouble connecting to our database. Please try again shortly.",
  P1008: "The database operation timed out. Please try again.",
};

/**
 * Friendly messages keyed by route context.
 * Use these to give route-specific human-readable errors.
 */
export const ROUTE_ERRORS = {
  enroll: {
    default: "We couldn't complete your enrollment. Please try again.",
    conflict: "You're already enrolled in this cohort.",
    full: "This cohort is now full. Please choose another.",
  },
  signup: {
    default: "We couldn't create your account. Please try again.",
    duplicate: "An account with this email already exists. Try signing in instead.",
  },
  verify: {
    default: "Email verification failed. Please request a new code and try again.",
    expired: "Your code has expired. Please go back and try signing up again.",
  },
  login: {
    default: "Sign-in failed. Please check your details and try again.",
  },
  generic: {
    default: "Something went wrong on our end. Please try again in a moment.",
  },
} as const;

type RouteContext = keyof typeof ROUTE_ERRORS;

/**
 * Resolves a user-friendly error message from any thrown value.
 * Always keeps the raw technical error in server logs.
 */
export function resolveUserMessage(err: unknown, context: RouteContext = "generic"): string {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;

    // Prisma known request errors
    if (e.code && typeof e.code === "string" && e.code.startsWith("P")) {
      return PRISMA_USER_MESSAGES[e.code] ?? ROUTE_ERRORS[context].default;
    }

    // Prisma validation errors
    if (e.name === "PrismaClientValidationError") {
      return "Invalid data was submitted. Please check your input and try again.";
    }

    // Network / connection issues
    if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND") {
      return "We're unable to reach our servers right now. Please try again shortly.";
    }
  }

  return ROUTE_ERRORS[context].default;
}

/**
 * Standard 500 error response with a user-friendly message.
 * Always logs the raw error to server stdout for debugging.
 */
export function serverError(
  err: unknown,
  label: string,
  context: RouteContext = "generic"
): NextResponse {
  console.error(`[${label}]`, err);
  const message = resolveUserMessage(err, context);
  return NextResponse.json({ error: message }, { status: 500 });
}
