"use client";

import dynamic from "next/dynamic";

const CoursePurchaseButton = dynamic(() => import("./CoursePurchaseButton"), { 
  ssr: false,
  loading: () => <div className="h-16 w-48 animate-pulse bg-white/5 rounded-3xl" />
});

export default function CoursePurchaseWrapper({ course }: { course: any }) {
  return <CoursePurchaseButton course={course} />;
}
