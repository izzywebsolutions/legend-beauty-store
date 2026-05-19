import { supabase } from "../supabaseClient";
import { cache as reactCache } from "react";

export interface HeroMedia {
  url: string;
  type: 'image' | 'video';
}

export interface SiteSettings {
  id?: number;
  updated_at?: string;
  storeName: string;
  logoUrl: string;
  faviconUrl: string;
  themeColor: string;

  heroHeadline: string;
  heroSubtext: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroMedia: HeroMedia[];

  whatsappNumber: string;
  supportPhone: string;
  storeEmail: string;
  storeAddress: string;

  instagramUrl: string;
  facebookUrl: string;
  xUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  telegramLink?: string;

  footerText: string;
  ourStoryText: string;
  faqText: string;
  promoBanner?: string;
  announcementBar?: string;

  deliveryInfo: string;
  shippingInfo: string;
  paymentInfo: string;

  poweredByText: string;
  poweredByLink: string;

  seoTitle: string;
  seoDescription: string;

  currency: string;
  extraSettings?: any;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: "Legend Beauty Store",
  logoUrl: "/logo.jpg",
  faviconUrl: "/favicon.ico",
  themeColor: "#4A0E2E", // Default plum

  heroHeadline: "Experience the glow of legend.",
  heroSubtext: "Premium quality hair, cosmetics, and jewelry at affordable prices.",
  heroButtonText: "Shop Now",
  heroButtonLink: "/shop",
  heroMedia: [
    { url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200", type: 'image' }
  ],

  whatsappNumber: "2348123456789",
  supportPhone: "2348123456789",
  storeEmail: "hello@legendbeauty.com",
  storeAddress: "Victoria Island, Lagos, Nigeria",

  instagramUrl: "",
  facebookUrl: "",
  xUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  telegramLink: "",

  footerText: "© 2024 Legend Beauty Store. All rights reserved.",
  ourStoryText: "Legend Beauty Store was founded with a single, passionate belief — that every woman deserves to feel legendary.",
  faqText: "We offer worldwide shipping and high-quality products. Contact us for any inquiries about your order.",
  promoBanner: "",
  announcementBar: "Free delivery on orders over ₦150,000!",

  deliveryInfo: "1–3 business days (Lagos)",
  shippingInfo: "Nationwide delivery available",
  paymentInfo: "Transfer / WhatsApp order",

  poweredByText: "Powered by Izzy Web Solutions",
  poweredByLink: "https://wa.me/2348123456789",

  seoTitle: "Legend Beauty Store | Luxury Hair & Cosmetics",
  seoDescription: "Shop the finest bundles, wigs, and cosmetics at Legend Beauty Store. Premium quality, affordable prices.",

  currency: "NGN",
  extraSettings: {}
};

// Global in-memory cache to prevent repeated database requests
let cachedSettings: SiteSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
let activeFetchPromise: Promise<SiteSettings> | null = null;

/** Get site settings from Supabase with retry logic, timeout, and multiple cache layers */
export const getSiteSettings = reactCache(async (): Promise<SiteSettings> => {
  // 1. In-memory cache hit (within TTL)
  const now = Date.now();
  if (cachedSettings && (now - cacheTime < CACHE_TTL)) {
    return cachedSettings;
  }

  // 2. Singleton fetch promise to deduplicate concurrent requests
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    // Strictly retry up to 2 times (3 total attempts) with exponential backoff
    const fetchWithRetry = async (retries = 2, delay = 1000): Promise<SiteSettings> => {
      try {
        const fetchPromise = supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        // Race against a strict 5 second timeout
        const result = await Promise.race([
          fetchPromise,
          new Promise<{ data: null; error: { message: string; code: string } }>((resolve) =>
            setTimeout(
              () => resolve({ data: null, error: { message: "Settings fetch timeout", code: "TIMEOUT" } }),
              5000
            )
          ),
        ]) as any;

        const { data, error } = result;

        if (error) {
          if (retries > 0) {
            // Exponential backoff delay
            await new Promise(res => setTimeout(res, delay));
            return fetchWithRetry(retries - 1, delay * 2);
          }
          throw error;
        }

        if (!data) return DEFAULT_SETTINGS;

        // Map DB snake_case to camelCase
        const mappedData: Partial<SiteSettings> = {
          updated_at: data.updated_at,
          storeName: data.store_name,
          logoUrl: data.logo_url,
          faviconUrl: data.favicon_url,
          themeColor: data.theme_color,
          heroHeadline: data.hero_headline,
          heroSubtext: data.hero_subtext,
          heroButtonText: data.hero_button_text,
          heroButtonLink: data.hero_button_link,
          heroMedia: data.hero_media,
          whatsappNumber: data.whatsapp_number,
          supportPhone: data.support_phone,
          storeEmail: data.store_email,
          storeAddress: data.store_address,
          instagramUrl: data.instagram_url,
          facebookUrl: data.facebook_url,
          xUrl: data.x_url,
          tiktokUrl: data.tiktok_url,
          youtubeUrl: data.youtube_url,
          telegramLink: data.telegram_link,
          footerText: data.footer_text,
          ourStoryText: data.our_story_text,
          faqText: data.faq_text,
          promoBanner: data.promo_banner,
          announcementBar: data.announcement_bar,
          deliveryInfo: data.delivery_info,
          shippingInfo: data.shipping_info,
          paymentInfo: data.payment_info,
          poweredByText: data.powered_by_text,
          poweredByLink: data.powered_by_link,
          seoTitle: data.seo_title,
          seoDescription: data.seo_description,
          currency: data.currency,
          extraSettings: data.extra_settings,
        };

        const cleanMappedData = Object.fromEntries(
          Object.entries(mappedData).filter(([_, v]) => v !== undefined && v !== null)
        );

        return {
          ...DEFAULT_SETTINGS,
          ...cleanMappedData
        };
      } catch (error: any) {
        if (retries > 0) {
          // Retry with exponential backoff
          await new Promise(res => setTimeout(res, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    };

    try {
      const settings = await fetchWithRetry();
      cachedSettings = settings;
      cacheTime = Date.now();
      return settings;
    } catch (error: any) {
      // Stale cache fallback: Return last cached settings if Supabase is unreachable/unstable
      if (cachedSettings) {
        return cachedSettings;
      }
      // Ultimate fallback to default configuration
      return DEFAULT_SETTINGS;
    } finally {
      // Clear the promise once completed so that subsequent calls after TTL can fetch fresh
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
});

/** Save site settings to Supabase */
export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  try {
    // Map camelCase back to snake_case for Supabase
    const rawSettings: Record<string, any> = {
      id: 1,
      store_name: settings.storeName,
      logo_url: settings.logoUrl,
      favicon_url: settings.faviconUrl,
      theme_color: settings.themeColor,
      hero_headline: settings.heroHeadline,
      hero_subtext: settings.heroSubtext,
      hero_button_text: settings.heroButtonText,
      hero_button_link: settings.heroButtonLink,
      hero_media: settings.heroMedia,
      whatsapp_number: settings.whatsappNumber,
      support_phone: settings.supportPhone,
      store_email: settings.storeEmail,
      store_address: settings.storeAddress,
      instagram_url: settings.instagramUrl,
      facebook_url: settings.facebookUrl,
      x_url: settings.xUrl,
      tiktok_url: settings.tiktokUrl,
      youtube_url: settings.youtubeUrl,
      telegram_link: settings.telegramLink,
      footer_text: settings.footerText,
      our_story_text: settings.ourStoryText,
      faq_text: settings.faqText,
      promo_banner: settings.promoBanner,
      announcement_bar: settings.announcementBar,
      delivery_info: settings.deliveryInfo,
      shipping_info: settings.shippingInfo,
      payment_info: settings.paymentInfo,
      powered_by_text: settings.poweredByText,
      powered_by_link: settings.poweredByLink,
      seo_title: settings.seoTitle,
      seo_description: settings.seoDescription,
      currency: settings.currency,
      extra_settings: settings.extraSettings,
      updated_at: new Date().toISOString()
    };

    // Clean: remove any keys with undefined values (Supabase rejects them)
    const dbSettings = Object.fromEntries(
      Object.entries(rawSettings).filter(([_, value]) => value !== undefined)
    );

    const { error } = await supabase
      .from('settings')
      .upsert(dbSettings, { onConflict: 'id' });

    if (error) {
      console.error("Supabase settings save error details:", JSON.stringify(error, null, 2));
      throw error;
    }

    // Invalidate local in-memory cache instantly so changes are pulled fresh on next request
    cachedSettings = null;
    cacheTime = 0;
  } catch (error) {
    console.error("Final error saving settings:", error);
    throw error;
  }
}

