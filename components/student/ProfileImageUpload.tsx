"use client";
import { useState, useRef } from "react";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";

export function ProfileImageUpload({ initialImage, name }: { initialImage?: string|null, name?: string|null }) {
  const [image, setImage] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    // In a real app, you'd upload to S3/Cloudinary. 
    // For now, we'll use a FileReader to show it and save the base64 (or a mock URL)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const r = await fetch("/api/student/profile/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });
      if (r.ok) {
        setImage(base64);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative group">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shrink-0 overflow-hidden ring-4 ring-white/5 shadow-2xl">
        {image ? (
          <img src={image} className="w-full h-full object-cover" />
        ) : (
          (name || "?")[0].toUpperCase()
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      <button 
        onClick={() => fileInput.current?.click()}
        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-slate-900 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-slate-900"
      >
        <Camera className="w-3.5 h-3.5" />
      </button>
      <input 
        type="file" 
        ref={fileInput} 
        className="hidden" 
        accept="image/*" 
        onChange={handleUpload}
      />
      {success && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg animate-bounce">
          <CheckCircle2 className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
