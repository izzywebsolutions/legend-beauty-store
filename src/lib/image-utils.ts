/**
 * Compresses an image file using HTML5 Canvas
 * @param file The original file
 * @param maxWidth Max width in pixels
 * @param quality Quality from 0 to 1
 * @param format Output format (image/webp or image/jpeg)
 * @returns Compressed file or original if it fails
 */
export async function compressImage(
  file: File, 
  maxWidth = 1200, 
  quality = 0.8,
  format: 'image/webp' | 'image/jpeg' = 'image/webp'
): Promise<File> {
  // Only compress images
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);

        // Check for WebP support
        const outputType = format;
        
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            
            // Generate new filename with correct extension
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const extension = outputType === 'image/webp' ? '.webp' : '.jpg';
            const newName = `${originalName}${extension}`;

            const compressedFile = new File([blob], newName, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
/** Exists in `public/` — used when product/hero images fail to load */
export const IMAGE_FALLBACK = "/default-logo.png";

/**
 * Global image error handler (client-side).
 * Uses a guard so a broken fallback cannot infinite-loop onError.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = IMAGE_FALLBACK
) {
  const target = event.currentTarget;
  if (target.getAttribute("data-img-fallback") === "1") return;
  target.setAttribute("data-img-fallback", "1");
  target.src = fallback;
}
