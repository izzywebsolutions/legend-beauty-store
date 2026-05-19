"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Lock, ChevronLeft, MessageCircle, MapPin, Phone, User, FileText } from "lucide-react"
import { useCart } from "@/lib/CartContext"
import { getSiteSettings, DEFAULT_SETTINGS, createOrder } from "@/lib/data"
import { generateWhatsAppMessage, openWhatsApp } from "@/lib/whatsapp"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, isLoaded, clearCart } = useCart()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Lagos",
    notes: ""
  })

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSiteSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  // Redirect if cart is empty after hydration
  useEffect(() => {
    if (isLoaded && cart.length === 0) {
      router.push("/shop")
    }
  }, [isLoaded, cart.length, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Save to database for tracking
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        delivery_address: `${formData.address}, ${formData.city}`,
        items: cart.map(item => ({
          id: item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant_name: item.selectedVariant?.name
        })),
        total_price: cartTotal,
        status: 'pending' as const,
        notes: formData.notes
      }
      
      await createOrder(orderData)

      // 2. Generate WhatsApp message
      const whatsappDetails = {
        customerName: formData.name,
        location: `${formData.address}, ${formData.city}`,
        notes: formData.notes,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variantName: item.selectedVariant?.name
        })),
        total: cartTotal
      }
      
      const message = generateWhatsAppMessage(whatsappDetails)
      
      // 3. Open WhatsApp
      openWhatsApp(settings.whatsappNumber, message)
      
      // 4. Clear cart and redirect
      clearCart()
      router.push("/")
    } catch (error) {
      console.error("Order submission failed:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded || cart.length === 0) return null

  return (
    <div className="flex flex-col bg-cream/30 min-h-screen">
      <main className="flex-1 py-6 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
           
           <div className="flex items-center justify-between mb-8">
              <Link href="/cart" className="flex items-center gap-2 text-plum/60 hover:text-plum transition-colors font-medium">
                 <ChevronLeft className="h-5 w-5" />
                 Back to Cart
              </Link>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-plum/10 shadow-sm">
                 <Lock className="h-4 w-4 text-gold" />
                 <span className="text-xs font-bold text-plum uppercase tracking-wider">Secure Checkout</span>
              </div>
           </div>
           
           <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
              
              {/* Checkout Form */}
              <div className="flex-1 space-y-6">
                 <div className="bg-white rounded-3xl shadow-sm border border-plum/10 p-6 md:p-10">
                    <h1 className="font-serif text-3xl text-plum mb-8">Delivery Details</h1>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label htmlFor="name" className="text-xs font-bold text-plum/40 uppercase tracking-widest flex items-center gap-2">
                             <User className="h-3 w-3" /> Full Name *
                          </label>
                          <input 
                             required
                             id="name"
                             value={formData.name}
                             onChange={handleInputChange}
                             placeholder="e.g. Jane Doe" 
                             className="w-full bg-cream/20 border border-plum/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum text-plum transition-all"
                          />
                       </div>

                       <div className="space-y-2">
                          <label htmlFor="phone" className="text-xs font-bold text-plum/40 uppercase tracking-widest flex items-center gap-2">
                             <Phone className="h-3 w-3" /> WhatsApp Phone Number *
                          </label>
                          <input 
                             required
                             type="tel" 
                             id="phone"
                             value={formData.phone}
                             onChange={handleInputChange}
                             placeholder="e.g. 08012345678" 
                             className="w-full bg-cream/20 border border-plum/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum text-plum transition-all"
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                             <label htmlFor="address" className="text-xs font-bold text-plum/40 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Delivery Address *
                             </label>
                             <input 
                                required
                                id="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street name, Apartment/Office number" 
                                className="w-full bg-cream/20 border border-plum/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum text-plum transition-all"
                             />
                          </div>
                          
                          <div className="space-y-2">
                             <label htmlFor="city" className="text-xs font-bold text-plum/40 uppercase tracking-widest">City</label>
                             <select 
                                id="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full bg-cream/20 border border-plum/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum text-plum appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A0E2E%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
                             >
                                <option>Lagos</option>
                                <option>Abuja</option>
                                <option>Port Harcourt</option>
                                <option>Ibadan</option>
                                <option>Enugu</option>
                                <option>Kano</option>
                                <option>Other (Northeast)</option>
                                <option>Other (Northwest)</option>
                                <option>Other (Southeast)</option>
                                <option>Other (Southwest)</option>
                             </select>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label htmlFor="notes" className="text-xs font-bold text-plum/40 uppercase tracking-widest flex items-center gap-2">
                             <FileText className="h-3 w-3" /> Special Delivery Notes (Optional)
                          </label>
                          <textarea 
                             id="notes"
                             value={formData.notes}
                             onChange={handleInputChange}
                             placeholder="Anything we should know? (e.g. preferred delivery time)" 
                             rows={3}
                             className="w-full bg-cream/20 border border-plum/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum text-plum transition-all"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="w-full lg:w-[400px] flex-shrink-0">
                 <div className="bg-white rounded-3xl shadow-xl border border-plum/5 p-6 md:p-8 sticky top-28 space-y-8">
                    <h2 className="font-serif text-2xl text-plum">Your Order</h2>
                    
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                       {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                             <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-plum/5 flex-shrink-0 bg-cream/30">
                                <img src={item.imageUrl} alt={item.name} className="object-cover h-full w-full" />
                                <span className="absolute -top-1 -right-1 bg-plum text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md">
                                   {item.quantity}
                                </span>
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="font-bold text-plum text-sm truncate">{item.name}</p>
                                {item.selectedVariant && (
                                   <p className="text-[10px] text-gold font-bold uppercase tracking-wider mt-0.5">{item.selectedVariant.name}</p>
                                )}
                             </div>
                             <span className="text-plum font-bold text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                       ))}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-plum/5">
                       <div className="flex justify-between text-plum/60 text-sm">
                          <span>Subtotal</span>
                          <span className="font-bold text-plum">₦{cartTotal.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-plum/60 text-sm">
                          <span>Delivery</span>
                          <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/5 px-2 py-0.5 rounded">Calculated at checkout</span>
                       </div>
                       <div className="flex justify-between items-center text-2xl font-bold text-plum pt-4">
                          <span>Total</span>
                          <span>₦{cartTotal.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="hidden lg:block pt-4">
                       <Button 
                         type="submit" 
                         size="lg" 
                         className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-plum/20 bg-plum hover:bg-plum-light transition-all active:scale-95"
                         disabled={isSubmitting}
                         onClick={(e) => {
                           e.preventDefault();
                           handleSubmit(e as any);
                         }}
                       >
                          {isSubmitting ? "Processing..." : (
                             <span className="flex items-center justify-center gap-2">
                                <MessageCircle className="h-6 w-6" />
                                Confirm on WhatsApp
                             </span>
                          )}
                       </Button>
                       <p className="mt-4 text-center text-[10px] text-plum/40 font-medium px-4 leading-relaxed">
                          By clicking above, your order details will be sent to our WhatsApp for final confirmation and payment.
                       </p>
                    </div>
                 </div>
              </div>

              {/* STICKY MOBILE CTA */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-plum/10 p-4 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                 <div className="flex justify-between items-center mb-4 px-4">
                    <div>
                       <p className="text-[10px] font-bold text-plum/40 uppercase tracking-[0.2em] mb-1">Final Amount</p>
                       <p className="text-2xl font-bold text-plum">₦{cartTotal.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">WhatsApp Order</p>
                       <p className="text-[10px] text-plum/50">Safe & Secure</p>
                    </div>
                 </div>
                 <Button 
                    type="submit"
                    className="w-full h-16 rounded-2xl bg-plum text-white font-bold text-lg shadow-xl shadow-plum/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }}
                 >
                    {isSubmitting ? "Processing..." : (
                       <>
                          <MessageCircle className="h-6 w-6" />
                          Complete on WhatsApp
                       </>
                    )}
                 </Button>
              </div>

           </form>
           
        </div>
      </main>
    </div>
  )
}
