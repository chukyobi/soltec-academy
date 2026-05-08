import ForgotPasswordClient from "@/components/auth/ForgotPasswordClient";

export default function TutorForgotPasswordPage() {
  return (
    <ForgotPasswordClient 
      role="tutor" 
      portalName="Tutor" 
      loginUrl="/tutor/login" 
    />
  );
}
