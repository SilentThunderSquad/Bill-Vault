import { supabase } from '@/services/supabase';

/**
 * Utility functions for handling bill file storage operations
 */

/** Extract storage file path from a Supabase public URL */
export function getStoragePath(publicUrl: string, bucket: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    // Strip query params (cache busters like ?t=123)
    const path = publicUrl.substring(idx + marker.length).split('?')[0];
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

/** Delete a file from Supabase storage (best-effort, won't throw) */
export async function deleteStorageFile(bucket: string, publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl) return;
  const path = getStoragePath(publicUrl, bucket);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}