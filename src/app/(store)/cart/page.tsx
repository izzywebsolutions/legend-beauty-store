"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Trash2, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/CartContext"
import { getSiteSettings, DEFAULT_SETTINGS, createOrder } from "@/lib/data"
import { useState, useEffect } from "react"

export default function CartPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart, cartCount } = useCart()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [isOrdering, setIsOrdering] = useState(false)
  
  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSiteSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  const shipping = cartCount > 0 ? 3000 : 0 // Mock shipping fee
  const total = cartTotal + shipping

  return (
    <div className="flex flex-col bg-cream/30">
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
           
           <h1 className="font-serif text-3xl md:text-4xl text-plum mb-8">Your Cart</h1>
           
           <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              
              {/* Cart Items List */}
              <div className="flex-1">
                 <div className="bg-white rounded-2xl shadow-sm border border-plum/10 p-6">
                    <div className="hidden md:grid grid-cols-12 gap-4 border-b border-plum/10 pb-4 mb-4 text-sm font-medium text-plum/60 tracking-wider uppercase">
                       <div className="col-span-6">Product</div>
                       <div className="col-span-2 text-center">Quantity</div>
                       <div className="col-span-3 text-right">Total</div>
                       <div className="col-span-1"></div>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                       {cart.length === 0 ? (
                          <div className="text-center py-12 text-plum/60 font-medium">Your cart is currently empty.</div>
                       ) : cart.map((item) => (
                          <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-plum/5 pb-6 last:border-0 last:pb-0">
                             
                             {/* Product Info */}
                             <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                                   <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                </div>
                                <div>
                                   <h3 className="font-serif text-lg text-plum line-clamp-2">{item.name}</h3>
                                   <p className="text-plum/60 mt-1">₦{item.price.toLocaleString()}</p>
                                </div>
                             </div>

                             {/* Quantity */}
                             <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center mt-4 md:mt-0">
                                <div className="flex items-center border border-plum/20 rounded-md h-10 w-28 bg-white overflow-hidden">
                                   <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 text-plum hover:bg-cream transition-colors h-full rounded-none">-</button>
                                   <span className="flex-1 text-center text-plum font-medium text-sm">{item.quantity}</span>
                                   <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 text-plum hover:bg-cream transition-colors h-full rounded-none">+</button>
                                </div>
                             </div>

                             {/* Item Total */}
                             <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center mt-2 md:mt-0">
                                <span className="md:hidden text-plum/60 text-sm">Total:</span>
                                <span className="font-medium text-plum">₦{(item.price * item.quantity).toLocaleString()}</span>
                             </div>

                             {/* Remove */}
                             <div className="col-span-1 flex justify-end">
                                <button onClick={() => removeFromCart(item.id)} className="text-plum/40 hover:text-red-500 transition-colors p-2">
                                   <span className="sr-only">Remove item</span>
                                   <Trash2 className="h-5 w-5" />
                                </button>
                             </div>

                          </div>
                       ))}
                    </div>
                    
                 </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96 flex-shrink-0">
                 <div className="bg-white rounded-2xl shadow-sm border border-plum/10 p-6 sticky top-28">
                    <h2 className="font-serif text-2xl text-plum mb-6 pb-4 border-b border-plum/10">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                       <div className="flex justify-between text-plum/80">
                          <span>Subtotal ({cartCount} items)</span>
                          <span className="font-medium">₦{cartTotal.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm text-green-600 font-medium italic">
                          <span>Shipping</span>
                          <span>Calculated on WhatsApp</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center text-xl md:text-2xl font-bold text-plum border-t border-plum/10 pt-5 mb-8">
                       <span>Total</span>
                       <span>₦{cartTotal.toLocaleString()}</span>
                    </div>

                      <Button 
                        size="lg" 
                        className="w-full group bg-[#25D366] hover:bg-[#128C7E] text-white h-14 rounded-xl text-lg shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all" 
                        disabled={isOrdering || cart.length === 0}
                        onClick={async () => {
                          if (cart.length === 0) return;
                          
                          setIsOrdering(true)
                          try {
                            // 1. Create the order in Supabase
                            const orderData = {
                              items: cart.map(item => ({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity
                              })),
                              total_price: cartTotal,
                              status: 'pending' as const
                            }
                            
                            await createOrder(orderData)

                            // 2. Redirect to WhatsApp
                            let text = `Hello *Legend Beauty Store*!\n\nI'd like to place an order:\n\n`;
                            cart.forEach(item => {
                               text += `• *${item.quantity}x ${item.name}* (₦${(item.price * item.quantity).toLocaleString()})\n`;
                            });
                            text += `\n*TOTAL: ₦${cartTotal.toLocaleString()}*`;
                            text += `\n\n_Note: Final shipping cost will be added based on my location._`;
                            
                            const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
                            window.open(url, "_blank");
                          } catch (error) {
                            console.error("Order processing failed:", error)
                          } finally {
                            setIsOrdering(false)
                          }
                      }}>
                        {isOrdering ? "Processing..." : "Order via WhatsApp"}
                        {!isOrdering && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                     </Button>
                    
                    <div className="mt-4 text-center">
                       <Link href="/shop" className="text-sm text-plum/60 hover:text-plum underline decoration-1 underline-offset-4 transition-colors">
                          or Continue Shopping
                       </Link>
                    </div>
                 </div>
              </div>

           </div>
           
        </div>
      </main>
    </div>
  )
}
