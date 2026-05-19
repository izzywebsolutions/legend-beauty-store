import { supabase } from "../supabaseClient";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant_name?: string;
}

export interface Order {
  id?: string;
  customer_name?: string;
  customer_phone?: string;
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  delivery_address?: string;
  notes?: string;
  created_at?: string;
}

/** Create a new order in Supabase */
export async function createOrder(order: Partial<Order>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...order,
        status: order.status || 'pending',
        created_at: new Date().toISOString()
      }])
      .select('id')
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}

/** Get all orders (for admin) */
export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') return [];
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

/** Update order status */
export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}
/** Delete an order from Supabase */
export async function deleteOrder(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}
