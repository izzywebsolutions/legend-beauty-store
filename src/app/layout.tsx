import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import "./globals.css";

import { getSiteSettings } from "@/lib/data"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const storeName = settings.storeName || "Legend Beauty Store";
  const description = settings.seoDescription || settings.heroSubtext || "Luxury Beauty, Hair, and Cosmetics. Beauty Redefined.";
  const title = settings.seoTitle || storeName;
  
  let validLogo = "/logo.png";
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    for (const ext of extensions) {
      if (fs.existsSync(path.join(publicDir, `logo${ext}`))) {
        validLogo = `/logo${ext}`;
        break;
      }
    }
  } catch (err) {
    console.error("Error finding logo", err)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://legendbeautystore.com';
  const logoToUse = settings.logoUrl || validLogo;
  const faviconToUse = settings.faviconUrl || "/favicon.ico";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${storeName}`,
    },
    description: description,
    keywords: ["beauty", "hair", "cosmetics", "bundles", "wigs", "luxury hair", "legend beauty"],
    authors: [{ name: storeName }],
    creator: storeName,
    publisher: storeName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      siteName: storeName,
      title: title,
      description: description,
      images: [
        {
          url: logoToUse,
          width: 800,
          height: 800,
          alt: storeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [logoToUse],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: faviconToUse,
      apple: logoToUse,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}
