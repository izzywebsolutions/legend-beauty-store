import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/app/actions/cloudinary'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Storage Helper: Upload a file (Now using Cloudinary)
 */
export async function uploadFile(file: File, bucket: string = 'products', customFileName?: string) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', bucket) // Map bucket name to Cloudinary folder

    const result = await uploadToCloudinary(formData)
    return result.secure_url
  } catch (error) {
    console.error('Error in uploadFile (Cloudinary):', error)
    throw error
  }
}

/**
 * Storage Helper: Delete a file (Handles both Supabase and Cloudinary)
 */
export async function deleteFile(fileUrl: string, bucket: string = 'products') {
  try {
    // Check if it's a Cloudinary URL
    if (fileUrl.includes('cloudinary.com')) {
      const publicId = await getPublicIdFromUrl(fileUrl)
      if (publicId) {
        await deleteFromCloudinary(publicId)
      }
      return
    }

    // Fallback for old Supabase URLs
    // Strip query parameters (e.g. ?v=timestamp cache busters) before extracting path
    const cleanUrl = fileUrl.split('?')[0];
    const urlParts = cleanUrl.split(bucket + '/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      if (!filePath) return; 
      await supabase.storage.from(bucket).remove([filePath]);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}

/**
 * Storage Helper: List all files in a specific bucket
 */
export async function listFiles(bucket: string = 'products') {
  const { data, error } = await supabase.storage.from(bucket).list();
  if (error) {
    console.error('Error listing files:', error);
    return [];
  }
  
  // Map files to include their full public URL
  return data.map(file => {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(file.name);
    return {
      ...file,
      publicUrl
    };
  });
}

/**
 * Storage Helper: Rename/Move a file
 */
export async function renameFile(oldName: string, newName: string, bucket: string = 'products') {
  const { error } = await supabase.storage.from(bucket).move(oldName, newName);
  if (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
}

export default supabase;
