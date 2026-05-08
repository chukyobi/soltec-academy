"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, CreditCard, ArrowRight, 
  ShieldCheck, Zap, Sparkles 
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";

interface Props {
  course: any;
}

export default function CoursePurchaseButton({ course }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: "student@soltec.com", // This should come from the session in a real app
    amount: course.price * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.reference }),
      });
      if (!res.ok) throw new Error("Purchase verification failed");
      
      router.push(`/student/courses/${course.id}`);
    } catch (e) {
      alert("Payment successful but verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    console.log("closed");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
       <button 
         onClick={() => initializePayment({onSuccess, onClose})}
         disabled={loading}
         className="w-full sm:w-auto px-12 py-6 bg-white text-black font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-2xl shadow-white/10 active:scale-95 disabled:opacity-50"
       >
         {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Enroll Now <ArrowRight className="w-5 h-5" /></>}
       </button>
       
       <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
             {[1,2,3].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0d0d14] bg-white/5 overflow-hidden flex items-center justify-center text-[10px] font-black text-white">
                  {i}
               </div>
             ))}
          </div>
          <p className="text-slate-500 text-xs font-bold leading-tight">
             Join <span className="text-white">12,402+</span> students <br /> already learning.
          </p>
       </div>
    </div>
  );
}
