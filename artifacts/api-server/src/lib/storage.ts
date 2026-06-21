import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "submissions";

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Upload a file to Supabase Storage (if configured) or leave it on disk.
 * Returns the public URL to store in the DB.
 *
 * @param localPath  Absolute path to the file on disk (written by multer)
 * @param storedName The UUID-prefixed filename chosen by multer
 * @param mimeType   MIME type of the file
 */
export async function uploadFile(
  localPath: string,
  storedName: string,
  mimeType: string,
): Promise<string> {
  const supabase = getClient();

  if (!supabase) {
    return `/api/uploads/${storedName}`;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const storagePath = `uploads/${storedName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) {
    logger.error({ err: error }, "Supabase Storage upload failed; falling back to local disk");
    return `/api/uploads/${storedName}`;
  }

  fs.unlink(localPath, (err) => {
    if (err) logger.warn({ err }, "Could not delete temp file after Supabase upload");
  });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage (if the URL belongs to Supabase).
 * Silently ignores local `/api/uploads/` URLs.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl || !SUPABASE_URL || fileUrl.startsWith("/api/")) return;

  const supabase = getClient();
  if (!supabase) return;

  try {
    const url = new URL(fileUrl);
    const pathAfterBucket = url.pathname.split(`/${BUCKET}/`)[1];
    if (!pathAfterBucket) return;
    await supabase.storage.from(BUCKET).remove([pathAfterBucket]);
  } catch (err) {
    logger.warn({ err, fileUrl }, "Failed to delete file from Supabase Storage");
  }
}
