import ForgotPasswordClient from "@/components/auth/ForgotPasswordClient";

export default function AdminForgotPasswordPage() {
  return (
    <ForgotPasswordClient 
      role="admin" 
      portalName="Admin" 
      loginUrl="/admin" 
    />
  );
}
