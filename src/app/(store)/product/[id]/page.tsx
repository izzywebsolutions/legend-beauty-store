"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, MessageCircle, ShoppingBag, Star, Loader2 } from "lucide-react"
import { useCart } from "@/lib/CartContext"
import { getProductById, Product, getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"
import { handleImageError, IMAGE_FALLBACK } from "@/lib/image-utils"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const { addToCart } = useCart()

  const gallery = useMemo(() => {
    if (!product) return [IMAGE_FALLBACK]
    return product.images?.length
      ? product.images
      : [product.imageUrl || IMAGE_FALLBACK]
  }, [product])

  useEffect(() => {
    setActiveImageIdx(0)
  }, [product?.id])
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [productData, settingsData] = await Promise.all([
          getProductById(params.id),
          getSiteSettings()
        ])
        
        if (productData) {
          setProduct(productData)
        }
        setSettings(settingsData)
      } catch (err) {
        console.error("Failed to fetch data", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-plum" />
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const handleWhatsAppOrder = () => {
     const price = product?.price || 0
     const text = `Hello Legend Beauty Store!\n\nI'd like to order:\n${quantity}x ${product.name} (₦${(price * quantity).toLocaleString()})\n\nProduct Link: ${window.location.href}`
     const wa = String(settings.whatsappNumber || "").replace(/\D/g, "")
     if (!wa) return
     const url = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
     window.open(url, "_blank")
  }

  const handleAddToCart = () => {
     if (product) addToCart(product, quantity)
  }

  return (
    <div className="flex flex-col bg-cream">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">
         
         <Link href="/shop" className="inline-flex items-center text-sm text-plum/60 hover:text-plum mb-8 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Shop
         </Link>

         <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Image Gallery */}
            <div className="w-full lg:w-1/2 space-y-4">
               <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-plum/5">
                  <img
                    src={gallery[activeImageIdx] || IMAGE_FALLBACK}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                    decoding="async"
                    onError={handleImageError}
                  />
               </div>
               
               {/* Thumbnails */}
               <div className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-square w-20 sm:w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all snap-start bg-white shadow-sm ${
                        idx === activeImageIdx ? "border-plum ring-2 ring-plum/20" : "border-transparent hover:border-plum focus:border-plum"
                      }`}
                    >
                        <img
                          src={img || IMAGE_FALLBACK}
                          alt={`${product.name} view ${idx + 1}`}
                          className="w-full h-full object-cover object-center"
                          decoding="async"
                          onError={handleImageError}
                        />
                    </button>
                  ))}
               </div>
            </div>

            {/* Product Info */}
            <div className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-10">
               <div className="mb-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase bg-gold/5 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
               </div>
               
               <h1 className="font-serif text-4xl lg:text-5xl text-plum mb-4 leading-tight">
                  {product.name}
               </h1>
               
               {/* Price Block */}
               <div className="flex flex-col gap-2 mb-6 py-6 border-y border-plum/5">
                  <div className="flex items-baseline gap-4">
                     <span className="text-3xl font-bold text-plum">
                        ₦{(product.price || 0).toLocaleString()}
                     </span>
                     <span className="text-xs font-bold text-plum/30 uppercase tracking-widest">Retail Price</span>
                  </div>
                  {product.wholesalePrice && (
                     <div className="flex items-center gap-3">
                        <span className="bg-gold/10 text-plum font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-gold/20">
                           Wholesale: ₦{product.wholesalePrice.toLocaleString()}
                        </span>
                        {product.moq && (
                           <span className="text-[10px] font-bold text-plum/40 uppercase tracking-tighter">Min. Order: {product.moq} units</span>
                        )}
                     </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                     {product.inStock ? (
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                           <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">In Stock</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                           <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                        </div>
                     )}
                  </div>
               </div>

               <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center text-gold">
                     {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-plum/20'}`} />
                     ))}
                  </div>
                  <span className="text-sm font-bold text-plum/80">{product.rating || "5.0"}</span>
                  <span className="h-4 w-px bg-plum/10" />
                  <span className="text-sm font-medium text-plum/60">{product.review_count || 0} Reviews</span>
               </div>

               <p className="text-plum/70 text-base leading-relaxed mb-10 max-w-xl">
                  {product.description || "Luxurious and meticulously crafted, this product is designed to elevate your beauty routine."}
               </p>

               <div className="space-y-4 mb-12">
                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex items-center justify-between border border-plum/10 rounded-xl h-14 w-full sm:w-32 bg-white px-2">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-plum/5 rounded-lg text-xl transition-colors text-plum">−</button>
                        <span className="font-bold text-plum">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 flex items-center justify-center hover:bg-plum/5 rounded-lg text-xl transition-colors text-plum">+</button>
                     </div>
                     <Button size="lg" className="flex-1 h-14 font-bold bg-plum hover:bg-plum-light text-white shadow-lg shadow-plum/10" onClick={handleAddToCart}>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Add to Cart
                     </Button>
                  </div>
                  
                  <Button size="lg" className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-lg shadow-green-500/10" onClick={handleWhatsAppOrder}>
                     <MessageCircle className="mr-2 h-5 w-5" />
                     Order via WhatsApp
                  </Button>
               </div>

               {/* Accordions / Tabs (Mocked) */}
               <div className="border-t border-plum/10 pt-8 space-y-6">
                  <div>
                     <h3 className="font-semibold text-plum mb-2 flex justify-between items-center cursor-pointer">
                        Product Details
                        <span className="text-xl leading-none">+</span>
                     </h3>
                     <p className="text-sm text-plum/70 hidden">Detailed specifications and ingredients would go here.</p>
                  </div>
                  <div className="border-t border-plum/10 pt-6">
                     <h3 className="font-semibold text-plum mb-2 flex justify-between items-center cursor-pointer">
                        Shipping & Returns
                        <span className="text-xl leading-none">+</span>
                     </h3>
                  </div>
               </div>

            </div>
         </div>

      </main>
    </div>
  )
}
