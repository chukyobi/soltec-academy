"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (Normally you'd extract this to lib/supabase.ts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UploadCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus("Uploading file to storage...");

    try {
      let fileUrl = null;

      if (zipFile) {
        const fileExt = zipFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `courses/${fileName}`;

        const { data, error } = await supabase.storage
          .from('soltec_acad_files')
          .upload(filePath, zipFile);

        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('soltec_acad_files')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      setUploadStatus("Simulating email notification & DB save...");

      // Simulate sending email to content creator
      await fetch("/api/studio/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          zipFileUrl: fileUrl,
        })
      });

      // Notification/Toast would be shown here 
      alert("Mail of acknowledgment sent! Your course is awaiting approval.");
      
      router.push("/studio/courses");
      router.refresh();
      
    } catch (error) {
      console.error(error);
      alert("Upload failed. Make sure you set up buckets!");
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-800">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Advanced System Design"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (USD)</label>
        <input 
          type="number" 
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
          placeholder="e.g. 49.99"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Bundle (.zip file)</label>
        <p className="text-xs text-gray-500 mb-2">Include your videos and all exercise files inside the zip folder.</p>
        <input 
          type="file" 
          accept=".zip,.rar,.7z"
          required
          onChange={(e) => setZipFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="What will students learn in this course?"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        ></textarea>
      </div>

      {uploadStatus && (
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">{uploadStatus}</p>
      )}

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition"
        >
          {loading ? 'Uploading...' : 'Submit Course'}
        </button>
      </div>
    </form>
  );
}
