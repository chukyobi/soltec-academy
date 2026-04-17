"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (Normally you'd extract this to lib/supabase.ts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CreateBlogForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Upload image to Supabase if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blog-images/${fileName}`;

        const { data, error } = await supabase.storage
          .from('soltec_acad_images')
          .upload(filePath, imageFile);

        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('soltec_acad_images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      // 2. Save it to API (which will save to Neon DB)
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          image: imageUrl,
          isFeatured
        })
      });

      if (!res.ok) throw new Error("Failed to create blog post");

      router.push("/admin/blog");
      router.refresh();
      
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blog Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Markdown Content</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        ></textarea>
      </div>

      <div className="flex items-center">
        <input 
          id="featured" 
          type="checkbox" 
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
        />
        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          Feature this post on Home Page
        </label>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </div>
    </form>
  );
}
