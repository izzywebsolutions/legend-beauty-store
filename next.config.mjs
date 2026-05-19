/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'emhqvzgutvzggdetwxzp.supabase.co', // Keep old fallback just in case
      },
    ],
  },
};

export default nextConfig;
