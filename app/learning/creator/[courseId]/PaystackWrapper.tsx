"use client";

import { useEffect, useRef, useState } from "react";

interface PaystackWrapperProps {
  amount: number;
  email: string;
  courseId: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaystackPop: any;
  }
}

export default function PaystackButtonWrapper({ amount, email, courseId }: PaystackWrapperProps) {
  const [success, setSuccess] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Avoid duplicating the script tag
    if (document.getElementById("paystack-script")) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    scriptRef.current = script;
  }, []);

  const handlePayment = () => {
    if (!scriptLoaded || !window.PaystackPop) return;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_sample_key",
      email,
      // Paystack expects kobo (NGN × 100). Multiply USD by 1500 for rough NGN conversion then × 100.
      amount: Math.round(amount * 1500 * 100),
      currency: "NGN",
      ref: `soltec_${Date.now()}`,
      onClose: () => {
        console.log("Paystack modal closed");
      },
      callback: async (response: { reference: string }) => {
        console.log("Payment successful, reference:", response.reference);
        // Create enrollment instance
        await fetch(`/api/learn/${courseId}/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, email }),
        });
        setSuccess(true);
      },
    });

    handler.openIframe();
  };

  if (success) {
    return (
      <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition duration-300">
        Access Course Now
      </button>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={!scriptLoaded}
      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition duration-300 shadow-md transform hover:-translate-y-1"
    >
      {scriptLoaded ? "Enroll Now" : "Loading..."}
    </button>
  );
}
