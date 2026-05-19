import { supabase, deleteFile } from "../supabaseClient";
import { IMAGE_FALLBACK } from "../image-utils";

function sanitizeMediaUrl(url: unknown): string {
  if (typeof url !== "string") return IMAGE_FALLBACK;
  const t = url.trim();
  if (!t) return IMAGE_FALLBACK;
  const lower = t.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:text/html")
  ) {
    return IMAGE_FALLBACK;
  }
  return t;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  wholesalePrice?: number;
  moq: number;
  imageUrl: string;
  images: string[];
  category: string;
  description: string;
  inStock: boolean;
  stockCount: number; // New field
  rating: number;
  review_count: number;
  badges: string[];
  options?: ProductOption[]; // New field
  variants?: ProductVariant[]; // New field
  created_at?: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stockCount: number;
  options: Record<string, string>;
  imageUrl?: string;
}

/** 
 * MAPPER: Frontend (camelCase) -> Database (snake_case) 
 */
function mapToDB(product: Partial<Product>) {
  return {
    id: product.id,
    name: product.name,
    price: product.price !== undefined ? Number(product.price) : undefined,
    wholesale_price: product.wholesalePrice !== undefined ? Number(product.wholesalePrice) : undefined,
    moq: product.moq !== undefined ? Math.max(1, Number(product.moq)) : undefined,
    image_url: product.imageUrl,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category,
    description: product.description,
    in_stock: product.inStock,
    stock_count: product.stockCount !== undefined ? Number(product.stockCount) : undefined,
    rating: product.rating !== undefined ? Number(product.rating) : undefined,
    review_count: product.review_count !== undefined ? Number(product.review_count) : undefined,
    badges: Array.isArray(product.badges) ? product.badges : [],
    options: product.options,
    variants: product.variants,
    created_at: product.created_at
  };
}

/** 
 * MAPPER: Database (snake_case) -> Frontend (camelCase) 
 */
function mapFromDB(row: any): Product {
  const rawImages = Array.isArray(row.images) ? row.images : [];
  const primaryCandidate = row.image_url || row.imageUrl || rawImages[0];
  const primary = sanitizeMediaUrl(primaryCandidate);
  return {
    id: row.id,
    name: row.name || "",
    price: Number(row.price) || 0,
    wholesalePrice: row.wholesale_price !== null ? Number(row.wholesale_price) : undefined,
    moq: Number(row.moq) || 1,
    imageUrl: primary,
    images: rawImages.length > 0 ? rawImages.map((u: unknown) => sanitizeMediaUrl(u)) : [primary],
    category: row.category || "General",
    description: row.description || "",
    inStock: row.in_stock !== undefined ? row.in_stock : (row.inStock ?? true),
    stockCount: Number(row.stock_count) || 0,
    rating: Number(row.rating) || 5.0,
    review_count: Number(row.review_count) || 0,
    badges: Array.isArray(row.badges) ? row.badges : [],
    options: Array.isArray(row.options) ? row.options : undefined,
    variants: Array.isArray(row.variants) ? row.variants : undefined,
    created_at: row.created_at
  };
}

/** 
 * VALIDATOR: Ensures payload is safe for Supabase 
 */
function validateProductPayload(payload: any) {
  const errors: string[] = [];

  if (payload.price !== undefined && isNaN(payload.price)) errors.push("Invalid Price (NaN)");
  if (payload.wholesale_price !== undefined && isNaN(payload.wholesale_price)) errors.push("Invalid Wholesale Price (NaN)");
  if (payload.rating !== undefined && (isNaN(payload.rating) || payload.rating < 0 || payload.rating > 5)) errors.push("Invalid Rating (0-5 required)");
  if (payload.moq !== undefined && (isNaN(payload.moq) || payload.moq < 1)) errors.push("Invalid MOQ (min 1)");

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  // Strip undefined to avoid overwriting with null unintentionally
  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Luxury Bone Straight Bundle",
    price: 85000,
    wholesalePrice: 75000,
    moq: 5,
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop"],
    category: "Human Hair",
    description: "100% Brazilian Human Hair, silky smooth and tangle-free.",
    inStock: true,
    stockCount: 50,
    rating: 4.8,
    review_count: 124,
    badges: ["Best Seller", "100% Human Hair"]
  }
];

/** Get products with pagination and filtering */
export async function getLocalProducts(options?: { 
  limit?: number, 
  offset?: number, 
  category?: string 
}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.range(
        options.offset || 0, 
        (options.offset || 0) + options.limit - 1
      );
    }

    if (options?.category && options.category !== "All") {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("FETCH ERROR:", JSON.stringify(error, null, 2));
      if (error.code === 'PGRST205' || error.code === '42P01') return PRODUCTS;
      throw error;
    }
    return (data || []).map(mapFromDB);
  } catch (error) {
    console.error("Error fetching products:", error);
    return PRODUCTS;
  }
}

/** Get related products based on category */
export async function getRelatedProducts(category: string, currentId: string, limit: number = 4): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', currentId)
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapFromDB);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

/** Get a single product by ID */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("FETCH SINGLE ERROR:", JSON.stringify(error, null, 2));
      throw error;
    }
    return data ? mapFromDB(data) : null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

/** Save or update a product in Supabase */
export async function saveLocalProduct(product: Partial<Product>): Promise<void> {
  const rawPayload = mapToDB(product);
  const cleanPayload = validateProductPayload(rawPayload);

  console.log("DEBUG: Sending Payload to Supabase:", JSON.stringify(cleanPayload, null, 2));

  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(cleanPayload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(
        "Supabase upsert error:",
        JSON.stringify(error, null, 2)
      );

      if (error?.message) {
        throw new Error(error.message);
      }

      if (error?.hint) {
        throw new Error(error.hint);
      }

      throw new Error("Unknown Supabase database error");
    }

    console.log("SUCCESS: Product saved:", JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("HARD SAVE FAILURE:", error.message || error);
    throw error;
  }
}

/** Delete a product from Supabase */
export async function deleteLocalProduct(id: string): Promise<void> {
  try {
    const product = await getProductById(id);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("DELETE ERROR:", JSON.stringify(error, null, 2));
      throw error;
    }

    if (product && product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        if (!imgUrl.includes("images.unsplash.com")) {
          const cleanUrl = imgUrl.split('?')[0];
          await deleteFile(cleanUrl).catch(err => console.error("Error cleaning up product image:", err));
        }
      }
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

