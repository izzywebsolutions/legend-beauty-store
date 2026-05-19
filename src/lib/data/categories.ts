import { supabase } from "../supabaseClient";

export const CATEGORIES = [
  "All",
  "Human Hair",
  "Cosmetics",
  "Jewelry",
  "Perfumes",
  "Accessories"
];

/** Get categories — fetches from Supabase categories table with retry logic */
export async function getCategories(): Promise<string[]> {
  const fetchWithRetry = async (retries = 2): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        if (retries > 0) {
          await new Promise(res => setTimeout(res, 1000));
          return fetchWithRetry(retries - 1);
        }
        if (error.code === 'PGRST205' || error.code === '42P01') return CATEGORIES;
        throw error;
      }
      
      if (data && data.length > 0) {
        const names = data.map(c => c.name);
        return ["All", ...names.filter(n => n !== "All")];
      }
      return CATEGORIES;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return CATEGORIES;
    }
  };

  return fetchWithRetry();
}

/** Save categories to Supabase (Add new ones) */
export async function saveCategories(categories: string[]): Promise<void> {
  try {
    // Current approach: upsert based on name
    const categoryObjects = categories
      .filter(name => name !== "All")
      .map(name => ({ name }));
    
    // First, we might need a more robust sync, but for now we upsert
    const { error } = await supabase
      .from('categories')
      .upsert(categoryObjects, { onConflict: 'name' });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving categories:", error);
    throw error;
  }
}

/** Delete a category from Supabase */
export async function deleteCategory(name: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', name);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

