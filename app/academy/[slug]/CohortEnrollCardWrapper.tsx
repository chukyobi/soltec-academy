"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the real enroll card with SSR disabled to prevent Paystack 'window is not defined' error
const CohortEnrollCard = dynamic(() => import("./CohortEnrollCard"), {
  ssr: false,
  loading: () => (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-10 flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 text-sm font-bold animate-pulse">Loading enrollment options...</p>
    </div>
  )
});

export default function CohortEnrollCardWrapper(props: any) {
  return <CohortEnrollCard {...props} />;
}
