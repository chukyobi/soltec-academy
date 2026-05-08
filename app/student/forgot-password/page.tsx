import ForgotPasswordClient from "@/components/auth/ForgotPasswordClient";

export default function StudentForgotPasswordPage() {
  return (
    <ForgotPasswordClient 
      role="student" 
      portalName="Student" 
      loginUrl="/student/login" 
    />
  );
}
