"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, TrendingUp, Users, ShoppingBag, DollarSign, Clock, CheckCircle, Package, AlertCircle } from "lucide-react"
import { getOrders, getLocalProducts, Order, Product } from "@/lib/data"
import Link from "next/link"

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [orderData, productData] = await Promise.all([
        getOrders(),
        getLocalProducts()
      ])
      setOrders(orderData)
      setProducts(productData)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Calculate Stats
  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.total_price, 0)
  
  const totalOrders = orders.length
  const uniqueCustomers = new Set(orders.map(o => o.customer_phone).filter(Boolean)).size
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  // Inventory Stats
  const totalUnits = products.reduce((sum, p) => sum + (p.stockCount || 0), 0)
  const lowStockProducts = products.filter(p => p.stockCount > 0 && p.stockCount <= 5)
  const outOfStockProducts = products.filter(p => !p.inStock || p.stockCount === 0)

  const recentOrders = orders.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-plum"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         
         <div className="bg-white rounded-2xl p-6 border border-plum/10 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-16 w-16 bg-gold/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="h-10 w-10 rounded-lg bg-plum/5 flex items-center justify-center text-plum">
                  <DollarSign className="h-5 w-5" />
               </div>
            </div>
            <div>
               <p className="text-plum/60 text-sm font-medium mb-1">Total Revenue</p>
               <h3 className="text-3xl font-serif text-plum tracking-tight">₦{totalRevenue.toLocaleString()}</h3>
               <p className="text-[10px] text-plum/40 mt-1 uppercase font-bold tracking-widest">Paid & Shipped</p>
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-plum/10 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-16 w-16 bg-gold/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="h-10 w-10 rounded-lg bg-plum/5 flex items-center justify-center text-plum">
                  <ShoppingBag className="h-5 w-5" />
               </div>
            </div>
            <div>
               <p className="text-plum/60 text-sm font-medium mb-1">Total Orders</p>
               <h3 className="text-3xl font-serif text-plum tracking-tight">{totalOrders}</h3>
               <p className="text-[10px] text-plum/40 mt-1 uppercase font-bold tracking-widest">Lifetime volume</p>
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-plum/10 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-16 w-16 bg-gold/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="h-10 w-10 rounded-lg bg-plum/5 flex items-center justify-center text-plum">
                  <Users className="h-5 w-5" />
               </div>
            </div>
            <div>
               <p className="text-plum/60 text-sm font-medium mb-1">Active Customers</p>
               <h3 className="text-3xl font-serif text-plum tracking-tight">{uniqueCustomers}</h3>
               <p className="text-[10px] text-plum/40 mt-1 uppercase font-bold tracking-widest">Unique Phone Numbers</p>
            </div>
         </div>

         <div className="bg-plum rounded-2xl p-6 shadow-sm relative overflow-hidden text-white group">
            <div className="absolute right-0 top-0 h-16 w-16 bg-gold/20 rounded-bl-full transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-gold">
                  <Clock className="h-5 w-5" />
               </div>
            </div>
            <div>
               <p className="text-white/80 text-sm font-medium mb-1">Pending Orders</p>
               <h3 className="text-3xl font-serif text-white tracking-tight">{pendingOrders}</h3>
               <p className="text-[10px] text-white/40 mt-1 uppercase font-bold tracking-widest">Requires attention</p>
            </div>
         </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Recent Orders */}
         <div className="lg:col-span-2 bg-white border border-plum/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-plum/10 flex justify-between items-center">
               <h3 className="font-serif text-xl text-plum">Recent Activity</h3>
               <Link href="/admin/orders" className="text-sm font-medium text-plum/60 hover:text-plum transition-colors">View All</Link>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-plum/60 uppercase bg-cream/30 border-b border-plum/10">
                     <tr>
                        <th className="px-6 py-4 font-medium">Order ID</th>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-plum/5">
                     {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-cream/20 transition-colors">
                           <td className="px-6 py-4 font-medium text-plum font-mono text-xs">#{order.id?.slice(0, 8)}</td>
                           <td className="px-6 py-4 text-plum/80">{order.customer_name || "Guest"}</td>
                           <td className="px-6 py-4 text-plum font-medium">₦{order.total_price.toLocaleString()}</td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                                  'bg-red-100 text-red-700'}`}
                              >
                                 {order.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                     {recentOrders.length === 0 && (
                        <tr>
                           <td colSpan={4} className="px-6 py-10 text-center text-plum/40 italic">No recent orders.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Store Overview Stats */}
         <div className="bg-white border border-plum/10 rounded-2xl shadow-sm">
            <div className="p-6 border-b border-plum/10 flex justify-between items-center">
               <h3 className="font-serif text-xl text-plum">Catalog Overview</h3>
               <Link href="/admin/products" className="text-sm font-medium text-plum/60 hover:text-plum transition-colors">Manage</Link>
            </div>
            <div className="p-6 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                        <ShoppingBag className="h-4 w-4" />
                     </div>
                     <span className="text-sm font-medium text-plum">Total Products</span>
                  </div>
                  <span className="text-lg font-serif font-bold text-plum">{products.length}</span>
               </div>

               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle className="h-4 w-4" />
                     </div>
                     <span className="text-sm font-medium text-plum">In Stock</span>
                  </div>
                  <span className="text-lg font-serif font-bold text-plum">{products.filter(p => p.inStock).length}</span>
               </div>

               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                        <AlertCircle className="h-4 w-4" />
                     </div>
                     <span className="text-sm font-medium text-plum">Out of Stock</span>
                  </div>
                  <span className="text-lg font-serif font-bold text-plum">{products.filter(p => !p.inStock).length}</span>
               </div>

               <div className="pt-4 border-t border-plum/5">
                  <p className="text-xs text-plum/40 italic text-center">
                     All data is synced with your Supabase database in real-time.
                  </p>
               </div>
            </div>
         </div>

      </div>

    </div>
  )
}
