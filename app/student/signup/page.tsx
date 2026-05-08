import crypto from "crypto";
import SignupClient from "./SignupClient";

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "fallback_secret_key_123456789012";

function decryptParams(encrypted: string) {
  try {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(":");
    if (!ivHex || !authTagHex || !encryptedText) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(SECRET_KEY.padEnd(32).slice(0, 32)), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}

export default async function StudentSignupPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ enc?: string, redirect?: string, email?: string, studentId?: string, step?: string, userId?: string }> 
}) {
  const params = await searchParams;
  let initialEmail = params.email || "";
  let initialStudentId = params.studentId || "";
  
  if (params.enc) {
    const data = decryptParams(params.enc);
    if (data) {
      initialEmail = data.email || "";
      initialStudentId = data.studentId || "";
    }
  }

  return (
    <SignupClient 
      initialEmail={initialEmail} 
      initialStudentId={initialStudentId} 
      initialRedirect={params.redirect || "/student/profile"}
      initialStep={params.step as any}
      initialUserId={params.userId}
    />
  );
}
