import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Storage helpers ────────────────────────────────────────────────────────────

export const BUCKETS = {
  COURSE_VIDEOS: "course-videos",
  COURSE_ZIPS: "course-zips",
  THUMBNAILS: "thumbnails",
} as const;

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
