"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { X, ShoppingBag, MessageCircle, ChevronLeft, ChevronRight, Star, Minus, Plus, ShieldCheck, CheckCircle2, Eye, Phone } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useCart } from "@/lib/CartContext"
import { Product, getSiteSettings, DEFAULT_SETTINGS, createOrder, getRelatedProducts, ProductVariant } from "@/lib/data"
import { handleImageError, IMAGE_FALLBACK } from "@/lib/image-utils"
import { generateQuickBuyMessage, openWhatsApp } from "@/lib/whatsapp"

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  /** Switch modal to another product (e.g. related / recently viewed) */
  onProductChange?: (product: Product) => void
}

export function ProductModal({ product, onClose, onProductChange }: ProductModalProps) {
  const { addToCart } = useCart()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSiteSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  // Recently Viewed Logic
  useEffect(() => {
    if (product) {
      try {
        const saved = localStorage.getItem('lbs_recently_viewed')
        let list: Product[] = saved ? JSON.parse(saved) : []
        
        // Filter out duplicates and current product
        list = list.filter(p => p.id !== product.id)
        
        // Add current to top
        list.unshift(product)
        
        // Keep last 6
        const trimmed = list.slice(0, 6)
        localStorage.setItem('lbs_recently_viewed', JSON.stringify(trimmed))
        setRecentlyViewed(trimmed.filter(p => p.id !== product.id))
      } catch (e) {
        console.error("Failed to update recently viewed:", e)
      }
    }
  }, [product?.id])

  // Related Products Logic
  useEffect(() => {
    if (product) {
      const fetchRelated = async () => {
        const data = await getRelatedProducts(product.category, product.id)
        setRelatedProducts(data)
      }
      fetchRelated()
    }
  }, [product?.id, product?.category])

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setActiveImage(0)
      setQuantity(1)
      setAddedToCart(false)
      
      // Initialize selected options with first values
      if (product.options && product.options.length > 0) {
        const initial: Record<string, string> = {}
        product.options.forEach(opt => {
          initial[opt.name] = opt.values[0]
        })
        setSelectedOptions(initial)
      } else {
        setSelectedOptions({})
      }
    }
  }, [product?.id])

  // Safe array fallback - memoized
  const images = useMemo(() => {
    if (!product) return [IMAGE_FALLBACK]
    const baseImages = (product.images && product.images.length > 0) 
      ? product.images 
      : (product.imageUrl ? [product.imageUrl] : [IMAGE_FALLBACK])
    return baseImages
  }, [product?.id, product?.images, product?.imageUrl]);

  // Derive current variant from selected options
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null
    return product.variants.find(v => 
      v.options && Object.entries(selectedOptions).every(([name, value]) => v.options[name] === value)
    ) || null
  }, [product?.variants, selectedOptions])

  // Sync active image with variant image if available
  useEffect(() => {
    if (currentVariant?.imageUrl) {
      const idx = images.indexOf(currentVariant.imageUrl)
      if (idx !== -1) setActiveImage(idx)
    }
  }, [currentVariant, images])

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = product ? "hidden" : ""

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [handleKeyDown, product])

  if (!product) return null

  // Memoized prices for stability
  const basePrice = product.price ?? 0
  const displayPrice = currentVariant?.price ?? basePrice
  const totalPrice = displayPrice * quantity

  const stock = currentVariant ? (currentVariant.stockCount ?? 0) : (product.stockCount ?? 0)
  const isOutOfStock = !product.inStock || stock <= 0

  const handleAddToCart = useCallback(() => {
    if (!product) return
    addToCart(product, quantity, currentVariant || undefined)
    setAddedToCart(true)
  }, [product, quantity, currentVariant, addToCart])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (addedToCart) {
      timeout = setTimeout(() => setAddedToCart(false), 2000)
    }
    return () => clearTimeout(timeout)
  }, [addedToCart])

  const handleWhatsApp = useCallback(async () => {
    if (!product) return
    setIsOrdering(true)
    try {
      const price = currentVariant?.price ?? product.price ?? 0
      const orderData = {
        items: [{
          id: product.id,
          name: product.name,
          price: price,
          quantity: quantity,
          variant_name: currentVariant?.name
        }],
        total_price: price * quantity,
        status: 'pending' as const
      }
      
      await createOrder(orderData)

      const message = generateQuickBuyMessage(
        product.name, 
        price, 
        currentVariant?.name
      )
      openWhatsApp(settings.whatsappNumber, message)
    } catch (error) {
       console.error("Order processing failed:", error)
    } finally {
       setIsOrdering(false)
    }
  }, [product, currentVariant, quantity, settings.whatsappNumber])

  const prevImage = useCallback(() => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length])
  const nextImage = useCallback(() => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length])

  // SEO: JSON-LD Schema
  // SEO: JSON-LD Schema - memoized
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Legend Beauty Store"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "NGN",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 5,
      "reviewCount": product.review_count || 1
    }
  }), [product.name, product.imageUrl, product.description, product.price, product.inStock, product.rating, product.review_count]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Product: ${product.name}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-plum/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 bg-white w-full max-w-5xl mx-4 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row">
            {/* Close Button (Floating) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-plum hover:bg-cream shadow-md transition-all active:scale-90"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* ── Left: Image Gallery ──────────────────────────────── */}
            <div className="relative w-full md:w-1/2 bg-cream flex-shrink-0 flex flex-col">
              <div className="relative aspect-square w-full overflow-hidden">
                <img
                  src={images[activeImage] || IMAGE_FALLBACK}
                  alt={`${product.name} image ${activeImage + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  decoding="async"
                  onError={handleImageError}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-plum shadow-lg hover:bg-white transition"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-plum shadow-lg hover:bg-white transition"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative aspect-square w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImage ? "border-gold shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img || IMAGE_FALLBACK} alt="" className="w-full h-full object-cover" decoding="async" onError={handleImageError} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product Details ───────────────────────────── */}
            <div className="flex-1 p-6 md:p-10 flex flex-col gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase bg-gold/5 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Authentic</span>
                  </div>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-plum leading-tight">
                  {product.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-plum/5">
                <div className="space-y-1">
                  <span className="text-3xl md:text-4xl font-bold text-plum">
                    ₦{displayPrice.toLocaleString()}
                  </span>
                  {product.wholesalePrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gold bg-plum/5 px-2 py-0.5 rounded uppercase tracking-tighter">Wholesale</span>
                      <span className="text-xs font-semibold text-plum/60">₦{product.wholesalePrice.toLocaleString()} (Min {product.moq})</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  {(() => {
                    if (isOutOfStock) return <span className="bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">✗ Out of Stock</span>
                    if (stock <= 5) return <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">⚠ Low Stock: {stock} left</span>
                    return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">✓ In Stock</span>
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(product.rating || 5) ? "fill-current" : "text-plum/20"}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-plum/80">
                  {product.rating || "5.0"}
                </span>
                <span className="h-4 w-px bg-plum/10" />
                <span className="text-sm font-medium text-plum/60">
                  {product.review_count || 0} reviews
                </span>
              </div>

              {/* Variant Selectors */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-6 py-2">
                  {product.options.map((option) => (
                    <div key={option.name} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-bold text-plum/40 uppercase tracking-[0.2em]">{option.name}</h4>
                        <span className="text-[10px] font-bold text-gold">{selectedOptions[option.name]}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => (
                          <button
                            key={value}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              selectedOptions[option.name] === value
                                ? "bg-plum text-white border-plum shadow-md scale-105"
                                : "bg-white text-plum/60 border-plum/10 hover:border-plum/30"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.badges.map((badge, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-bold bg-cream text-plum px-4 py-2 rounded-xl border border-plum/10">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      <span className="uppercase tracking-tight">{badge}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                 <h4 className="text-[10px] font-bold text-plum/40 uppercase tracking-[0.2em]">Description</h4>
                 <p className="text-plum/70 text-sm md:text-base leading-relaxed">
                   {product.description}
                 </p>
              </div>

              {/* Trust Banner */}
              <div className="grid grid-cols-2 gap-3 py-4 border-y border-plum/10">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                       <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-plum uppercase tracking-tighter">100% Quality</p>
                       <p className="text-[9px] text-plum/60 font-medium">Guaranteed</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                       <Phone className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-plum uppercase tracking-tighter">Fast Support</p>
                       <p className="text-[9px] text-plum/60 font-medium">via WhatsApp</p>
                    </div>
                 </div>
              </div>

              {/* Action Area (Desktop) */}
              <div className="hidden md:flex flex-col gap-6 mt-6 pt-8 border-t border-plum/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center border-2 border-plum/10 rounded-2xl overflow-hidden h-14 bg-cream/30">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-6 text-plum hover:bg-plum/5 transition-colors h-full"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-xl text-plum">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-6 text-plum hover:bg-plum/5 transition-colors h-full"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-plum/40 uppercase tracking-widest">Total Price</span>
                    <span className="text-3xl font-bold text-plum">₦{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 h-16 rounded-2xl text-lg font-bold shadow-xl shadow-plum/20 transition-all hover:scale-[1.02] active:scale-95"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <ShoppingBag className="h-6 w-6 mr-2" />
                    {addedToCart ? "✓ Added!" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-16 rounded-2xl border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold text-lg transition-all active:scale-95"
                    onClick={handleWhatsApp}
                    disabled={isOrdering}
                  >
                    <MessageCircle className="h-6 w-6 mr-2" />
                    {isOrdering ? "Ordering..." : "WhatsApp Order"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS SECTION */}
          {relatedProducts.length > 0 && (
            <div className="p-6 md:p-10 bg-cream/30 border-t border-plum/10">
              <h3 className="font-serif text-2xl text-plum mb-6 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-gold" />
                You May Also Like
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map(rp => (
                  <div
                    key={rp.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onProductChange?.(rp)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onProductChange?.(rp)
                      }
                    }}
                    className="bg-white rounded-2xl p-3 border border-plum/5 shadow-sm group hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                      <img src={rp.imageUrl || IMAGE_FALLBACK} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={handleImageError} />
                    </div>
                    <h4 className="text-xs font-bold text-plum line-clamp-1 mb-1">{rp.name}</h4>
                    <p className="text-sm font-bold text-plum">₦{(rp.price ?? 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENTLY VIEWED SECTION */}
          {recentlyViewed.length > 0 && (
            <div className="p-6 md:p-10 border-t border-plum/10">
              <h3 className="font-serif text-xl text-plum/60 mb-6 flex items-center gap-2 uppercase tracking-widest text-sm font-bold">
                <Eye className="h-4 w-4" />
                Recently Viewed
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {recentlyViewed.map(rp => (
                  <div
                    key={rp.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onProductChange?.(rp)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onProductChange?.(rp)
                      }
                    }}
                    className="min-w-[120px] max-w-[120px] group cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-cream">
                      <img src={rp.imageUrl || IMAGE_FALLBACK} alt={rp.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={handleImageError} />
                    </div>
                    <p className="text-[10px] font-bold text-plum/70 line-clamp-1">{rp.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STICKY MOBILE CTA */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-plum/10 p-4 pb-8 flex flex-col gap-3 rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-1 px-1">
             <div className="flex items-center border border-plum/20 rounded-xl overflow-hidden h-12 bg-white w-32">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex-1 flex items-center justify-center text-plum h-full"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-bold text-plum">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="flex-1 flex items-center justify-center text-plum h-full"><Plus className="h-4 w-4" /></button>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-bold text-plum/40 uppercase tracking-widest mb-1">Subtotal</p>
                <p className="text-xl font-bold text-plum">₦{totalPrice.toLocaleString()}</p>
             </div>
          </div>
          <div className="flex gap-2">
             <Button
               className="flex-1 h-14 rounded-xl bg-plum text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
               onClick={handleAddToCart}
               disabled={isOutOfStock}
             >
               {addedToCart ? "✓ Added!" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
             </Button>
             <Button
               className="flex-1 h-14 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
               onClick={handleWhatsApp}
               disabled={isOrdering}
             >
               WhatsApp
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
