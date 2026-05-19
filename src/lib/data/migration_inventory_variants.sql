-- SQL Migration: Inventory & Variants Support
-- Adds stock_count, options, and variants columns to the products table

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN products.stock_count IS 'Total units in stock (fallback if no variants)';
COMMENT ON COLUMN products.options IS 'Selectable product options (e.g. Length, Color)';
COMMENT ON COLUMN products.variants IS 'Specific product combinations with overridden price/stock';

-- Update Orders table for better checkout tracking
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update Order Items if stored as jsonb (check if needed)
-- If order items are a separate table, you might need:
-- ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_name TEXT;
