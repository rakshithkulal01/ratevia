import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSupabaseAdmin } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads/stickers');

/**
 * Uploads or stores a base64 rendered sticker PNG for a business request.
 * Prioritizes Supabase Storage bucket 'business-requests'.
 * Gracefully falls back to local static disk storage if Supabase storage is unavailable.
 */
export async function storeStickerImage(requestId, base64DataOrUrl) {
  if (!base64DataOrUrl || typeof base64DataOrUrl !== 'string') return null;

  // If already an HTTP/HTTPS URL, return it directly
  if (base64DataOrUrl.startsWith('http://') || base64DataOrUrl.startsWith('https://')) {
    return base64DataOrUrl;
  }

  // Parse base64
  const matches = base64DataOrUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const base64String = matches ? matches[2] : base64DataOrUrl;
  const buffer = Buffer.from(base64String, 'base64');

  const fileName = `${requestId}/sticker.png`;

  // 1. Try Supabase Storage
  try {
    const sb = getSupabaseAdmin();
    const { error: uploadError } = await sb.storage
      .from('business-requests')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = sb.storage
        .from('business-requests')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        console.log(`[StickerStorage] Uploaded to Supabase Storage: ${publicUrlData.publicUrl}`);
        return publicUrlData.publicUrl;
      }
    } else {
      console.warn('[StickerStorage] Supabase upload warning, using local fallback:', uploadError.message);
    }
  } catch (err) {
    console.warn('[StickerStorage] Supabase storage exception, using local fallback:', err.message);
  }

  // 2. Local Fallback
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const localFilePath = path.join(UPLOADS_DIR, `${requestId}.png`);
    fs.writeFileSync(localFilePath, buffer);
    console.log(`[StickerStorage] Saved locally: ${localFilePath}`);
    return `/uploads/stickers/${requestId}.png`;
  } catch (err) {
    console.error('[StickerStorage] Local fallback failed:', err);
    // If local write fails, store as data URI so visual image is never lost
    return base64DataOrUrl.startsWith('data:') ? base64DataOrUrl : `data:image/png;base64,${base64String}`;
  }
}

/**
 * Removes a stored sticker image from Supabase Storage and local disk storage.
 * Idempotent: Does not throw if file was already removed.
 */
export async function deleteStickerImage(requestId, stickerImageUrl) {
  if (!requestId) return;

  // 1. Delete from Supabase Storage bucket
  try {
    const sb = getSupabaseAdmin();
    const fileName = `${requestId}/sticker.png`;
    const { error } = await sb.storage.from('business-requests').remove([fileName]);
    if (error) {
      console.warn(`[StickerStorage] Supabase removal notice for ${requestId}:`, error.message);
    } else {
      console.log(`[StickerStorage] Removed from Supabase storage: ${fileName}`);
    }
  } catch (err) {
    console.warn(`[StickerStorage] Supabase removal exception for ${requestId}:`, err.message);
  }

  // 2. Delete from local disk fallback
  try {
    const localFilePath = path.join(UPLOADS_DIR, `${requestId}.png`);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log(`[StickerStorage] Removed local sticker file: ${localFilePath}`);
    }
  } catch (err) {
    console.warn(`[StickerStorage] Local file unlink notice for ${requestId}:`, err.message);
  }
}

