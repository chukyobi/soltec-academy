"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AdminCourseActions({ courseId }: { courseId: string }) {
  const [status, setStatus] = useState<"idle" | "approving" | "rejecting" | "approved" | "rejected">("idle");

  async function approve() {
    setStatus("approving");
    const res = await fetch(`/api/admin/courses/${courseId}/approve`, { method: "POST" });
    setStatus(res.ok ? "approved" : "idle");
  }

  async function reject() {
    setStatus("rejecting");
    const res = await fetch(`/api/admin/courses/${courseId}/reject`, { method: "POST" });
    setStatus(res.ok ? "rejected" : "idle");
  }

  if (status === "approved") return (
    <span className="text-green-400 font-bold text-sm flex items-center gap-1">
      <CheckCircle className="w-4 h-4" /> Approved
    </span>
  );
  if (status === "rejected") return (
    <span className="text-red-400 font-bold text-sm flex items-center gap-1">
      <XCircle className="w-4 h-4" /> Rejected
    </span>
  );

  return (
    <div className="flex gap-2 shrink-0">
      <button onClick={approve} disabled={status !== "idle"}
        className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 font-bold text-sm rounded-xl transition disabled:opacity-50">
        {status === "approving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        Approve
      </button>
      <button onClick={reject} disabled={status !== "idle"}
        className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold text-sm rounded-xl transition disabled:opacity-50">
        {status === "rejecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        Reject
      </button>
    </div>
  );
}
