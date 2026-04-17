// Auth pages (login/signup) have no sidebar — bare layout
export default function StudioAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
