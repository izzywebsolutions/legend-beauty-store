'use server';

import cloudinary from '@/lib/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string || 'legend-beauty-store';

  if (!file) {
    throw new Error('No file provided');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Automatically detect if it's an image or video
        quality: 'auto',      // Cloudinary optimization
        fetch_format: 'auto', // Cloudinary optimization
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Upload failed'));
          return;
        }
        resolve(result);
      }
    ).end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Helper to extract public_id from Cloudinary URL
 */
export async function getPublicIdFromUrl(url: string) {
  // Cloudinary URLs usually look like: 
  // https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[extension]
  // We need to extract [folder]/[public_id]
  
  if (!url.includes('cloudinary.com')) return null;

  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Skip the 'upload' and 'v[version]' parts
    const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
    // Remove extension
    const publicId = publicIdWithExt.split('.').slice(0, -1).join('.');
    return publicId;
  } catch (error) {
    return null;
  }
}
