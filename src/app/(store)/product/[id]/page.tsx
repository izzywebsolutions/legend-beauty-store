"use client"

import { useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, MessageCircle, ShoppingBag, Star, Loader2 } from "lucide-react"
import { useCart } from "@/lib/CartContext"
import { getProductById, Product } from "@/lib/data"
import { handleImageError } from "@/lib/image-utils"
import { useEffect } from "react"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCart()
  
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const data = await getProductById(params.id)
        if (data) {
          setProduct(data)
        }
      } catch (err) {
        console.error("Failed to fetch product", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
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
     const text = `Hello Legend Beauty Store!\n\nI'd like to order:\n${quantity}x ${product.name} (₦${(product.price * quantity).toLocaleString()})\n\nProduct Link: ${window.location.href}`
     const url = `https://wa.me/2340000000000?text=${encodeURIComponent(text)}`
     window.open(url, "_blank")
  }

  const handleAddToCart = () => {
     addToCart(product, quantity)
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
               <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                    decoding="async"
                    onError={handleImageError}
                  />
               </div>
               
               {/* Thumbnails (Mocked using the same image if no others exist) */}
               <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                  {(product.images || [product.imageUrl, product.imageUrl, product.imageUrl]).map((img, idx) => (
                    <button key={idx} className="relative aspect-square w-20 sm:w-24 shrink-0 overflow-hidden rounded-lg border-2 border-transparent hover:border-plum focus:border-plum transition-all snap-start bg-white">
                        <img
                          src={img}
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
                  <span className="text-sm font-semibold tracking-wider text-gold uppercase">
                    {product.category}
                  </span>
               </div>
               
               <h1 className="font-serif text-4xl lg:text-5xl text-plum mb-4">
                  {product.name}
               </h1>
               
               {/* Price Block */}
               <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-baseline gap-4">
                     <span className="text-3xl font-bold text-plum">
                        ₦{product.price.toLocaleString()}
                     </span>
                     <span className="text-sm text-plum/60 line-through">Retail</span>
                  </div>
                  {product.wholesalePrice && (
                     <div className="flex items-center gap-3">
                        <span className="bg-gold/20 text-plum font-semibold text-sm px-3 py-1 rounded-full">
                           Wholesale: ₦{product.wholesalePrice.toLocaleString()}
                        </span>
                        {product.moq && (
                           <span className="text-xs text-plum/60">Min. Order: {product.moq} units</span>
                        )}
                     </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                     {product.inStock ? (
                        <span className="text-green-600 text-xs font-semibold tracking-wide">✓ In Stock</span>
                     ) : (
                        <span className="text-red-500 text-xs font-semibold tracking-wide">✗ Out of Stock</span>
                     )}
                  </div>
               </div>

               <div className="flex items-center text-gold mb-6">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 text-plum/20" />
                  <Star className="h-4 w-4 text-plum/20" />
                  <span className="text-xs text-plum/60 ml-2">(12 Reviews)</span>
               </div>

               <p className="text-plum/80 text-base leading-relaxed mb-10">
                  {product.description || "Luxurious and meticulously crafted, this product is designed to elevate your beauty routine."}
               </p>

               <div className="space-y-4 mb-12">
                  <div className="flex gap-4">
                     <Button size="lg" className="flex-1 font-bold" onClick={handleAddToCart}>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Add to Cart
                     </Button>
                     <div className="flex items-center justify-center w-32 border border-plum/20 rounded-md">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-plum/5 text-lg">−</button>
                        <span className="font-medium">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-plum/5 text-lg">+</button>
                     </div>
                  </div>
                  
                  <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold" onClick={handleWhatsAppOrder}>
                     <MessageCircle className="mr-2 h-5 w-5" />
                     Buy Now via WhatsApp
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
