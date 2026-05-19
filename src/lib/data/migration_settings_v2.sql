-- SAFE ADMIN SETTINGS & DATABASE ALIGNMENT MIGRATION
-- This script adds missing columns to the 'settings' table without destroying existing data.

-- Check and add missing social media and contact columns
ALTER TABLE IF EXISTS settings 
ADD COLUMN IF NOT EXISTS tiktok_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS support_phone TEXT DEFAULT '2348123456789',
ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'Legend Beauty Store | Luxury Hair & Cosmetics',
ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Shop the finest bundles, wigs, and cosmetics at Legend Beauty Store. Premium quality, affordable prices.';

-- Ensure existing columns have correct types and defaults if necessary
-- (Supabase handles this gracefully, but good for completeness)
-- ALTER TABLE settings ALTER COLUMN instagram_url SET DEFAULT '';
-- ALTER TABLE settings ALTER COLUMN facebook_url SET DEFAULT '';
-- ALTER TABLE settings ALTER COLUMN twitter_url SET DEFAULT '';

-- Comment: No destructive operations (DROP) are performed here.
