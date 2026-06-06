export type MediaSource = "Cloudinary" | "Supabase" | "Unknown";

export interface MediaSourceInfo {
  source: MediaSource;
  color: string;
}

/**
 * Detects the source of a media URL based on the domain.
 */
export function getMediaSource(url: string): MediaSourceInfo {
  if (!url) {
    return { source: "Unknown", color: "gray" };
  }

  if (url.includes("res.cloudinary.com")) {
    return { source: "Cloudinary", color: "green" };
  }

  if (url.includes("supabase")) {
    return { source: "Supabase", color: "blue" };
  }

  return { source: "Unknown", color: "gray" };
}
