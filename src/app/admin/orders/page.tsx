"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Filter, Trash2, X, CheckCircle, Package, Clock, AlertCircle } from "lucide-react"
import { getOrders, updateOrderStatus, deleteOrder, Order } from "@/lib/data"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("All")
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const data = await getOrders()
    setOrders(data)
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      await fetchOrders()
    } catch (err) {
      alert("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id)
        await fetchOrders()
      } catch (err) {
        alert("Failed to delete order")
      }
    }
  }

  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === "All" || order.status === filterStatus.toLowerCase()
    const searchLower = search.toLowerCase()
    const searchMatch = 
      (order.id?.toLowerCase().includes(searchLower) || 
       order.customer_name?.toLowerCase().includes(searchLower) ||
       order.customer_phone?.includes(searchLower))
    return statusMatch && searchMatch
  })

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="font-serif text-3xl text-plum mb-1">Orders</h1>
            <p className="text-sm text-plum/60">Manage and track customer orders in real-time.</p>
         </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-plum/10">
         <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum/50" />
            <Input 
              placeholder="Search orders, customers, phones..." 
              className="pl-9 h-10 border-plum/20" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex gap-4">
            <select 
              className="h-10 px-3 rounded-md border border-plum/20 text-sm text-plum bg-white focus:outline-none focus:ring-1 focus:ring-plum"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
               <option>All</option>
               <option>Pending</option>
               <option>Paid</option>
               <option>Shipped</option>
               <option>Cancelled</option>
            </select>
         </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-plum/10 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-plum/60 uppercase bg-cream/50 border-b border-plum/10">
                  <tr>
                     <th className="px-6 py-4 font-medium">Order ID</th>
                     <th className="px-6 py-4 font-medium">Customer</th>
                     <th className="px-6 py-4 font-medium">Date</th>
                     <th className="px-6 py-4 font-medium">Total</th>
                     <th className="px-6 py-4 font-medium">Status</th>
                     <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-plum/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-plum/40 italic">
                        Loading orders...
                      </td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                     <tr key={order.id} className="hover:bg-cream/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-plum font-mono text-xs">
                           #{order.id?.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-medium text-plum">{order.customer_name || "Guest User"}</p>
                           <p className="text-xs text-plum/50">{order.customer_phone || "No Phone"}</p>
                        </td>
                        <td className="px-6 py-4 text-plum/80">
                           {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-medium text-plum">₦{order.total_price.toLocaleString()}</p>
                           <p className="text-xs text-plum/50">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="px-6 py-4">
                           <select 
                             className={`text-xs font-semibold px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer
                               ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                 order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                 order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                                 'bg-red-100 text-red-700'}`}
                             value={order.status}
                             onChange={(e) => handleStatusChange(order.id!, e.target.value as any)}
                           >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="shipped">Shipped</option>
                              <option value="cancelled">Cancelled</option>
                           </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 text-plum/60 hover:text-plum hover:bg-plum/5 rounded-md transition-colors" 
                                title="View Details"
                              >
                                 <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(order.id!)}
                                className="p-2 text-plum/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                title="Delete Order"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  
                  {!loading && filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-plum/40 italic">
                        No orders found.
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
         
         <div className="px-6 py-4 border-t border-plum/10 flex items-center justify-between text-sm text-plum/60">
            <span>Showing {filteredOrders.length} orders</span>
         </div>
      </div>

       {/* Order Details Modal */}
       {selectedOrder && (
          <div className="fixed inset-0 bg-plum/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-plum/10 flex items-center justify-between">
                   <div>
                      <h2 className="font-serif text-2xl text-plum">Order Details</h2>
                      <p className="text-xs text-plum/40 font-mono">ID: {selectedOrder.id}</p>
                   </div>
                   <button 
                     onClick={() => setSelectedOrder(null)}
                     className="p-2 hover:bg-plum/5 rounded-full transition-colors"
                   >
                      <X className="h-6 w-6 text-plum/60" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                   {/* Customer Info */}
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <h4 className="text-[10px] font-bold text-plum/40 uppercase tracking-widest mb-2">Customer</h4>
                         <p className="font-serif text-lg text-plum">{selectedOrder.customer_name || "Guest User"}</p>
                         <p className="text-sm text-plum/60">{selectedOrder.customer_phone || "No phone provided"}</p>
                      </div>
                      <div className="text-right">
                         <h4 className="text-[10px] font-bold text-plum/40 uppercase tracking-widest mb-2">Date Placed</h4>
                         <p className="text-sm text-plum font-medium">
                            {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}
                         </p>
                      </div>
                   </div>

                   {/* Items List */}
                   <div>
                      <h4 className="text-[10px] font-bold text-plum/40 uppercase tracking-widest mb-4">Items Summary</h4>
                      <div className="space-y-3">
                         {selectedOrder.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-plum/5 last:border-0 font-medium">
                               <div className="flex items-center gap-3">
                                  <div className="h-4 w-4 rounded-full bg-gold/20 flex items-center justify-center text-[10px] text-plum">
                                     {item.quantity}
                                  </div>
                                  <span className="text-plum text-sm">{item.name}</span>
                               </div>
                               <span className="text-plum/80 text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Order Status */}
                   <div className="bg-cream/30 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         {selectedOrder.status === 'pending' && <Clock className="h-5 w-5 text-amber-500" />}
                         {selectedOrder.status === 'paid' && <CheckCircle className="h-5 w-5 text-green-500" />}
                         {selectedOrder.status === 'shipped' && <Package className="h-5 w-5 text-blue-500" />}
                         {selectedOrder.status === 'cancelled' && <AlertCircle className="h-5 w-5 text-red-500" />}
                         <span className="text-sm font-semibold text-plum uppercase tracking-wide">
                            {selectedOrder.status}
                         </span>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-plum/40 font-bold uppercase tracking-widest">Total Amount</p>
                         <p className="text-2xl font-serif text-plum font-bold italic">₦{selectedOrder.total_price.toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-cream/20 border-t border-plum/10 flex justify-end">
                   <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                </div>
             </div>
          </div>
       )}
    </div>
  )
}
