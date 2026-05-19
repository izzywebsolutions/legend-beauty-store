import { ShoppingBag, Star } from "lucide-react"
import { useCart } from "@/lib/CartContext"
import { Product } from "@/lib/data"
import { memo } from "react"
import { handleImageError, IMAGE_FALLBACK } from "@/lib/image-utils"
import { useRouter } from "next/navigation"

export interface ProductCardProps {
  product: Product
  onClick?: (product: Product) => void
}

export const ProductCard = memo(function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart()
  const router = useRouter()

  const handleCardClick = () => {
    if (onClick) {
      onClick(product)
    } else {
      router.push(`/product/${product.id}`)
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col gap-3 transition-all duration-500 cursor-pointer"
    >
      
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream/50 shadow-sm border border-plum/5 group-hover:shadow-md transition-all duration-500">
        <img
          src={product.imageUrl || IMAGE_FALLBACK}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        
        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {product.badges.slice(0, 2).map((badge, idx) => (
              <span 
                key={idx} 
                className="bg-gold/90 backdrop-blur-md text-plum text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest border border-gold/20"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        
        {/* Add to Bag Button (Floating) */}
        <button 
          onClick={(e) => {
             e.preventDefault()
             e.stopPropagation()
             addToCart(product, 1)
          }}
          className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-plum text-white shadow-xl transition-all hover:scale-110 hover:bg-plum-light active:scale-95 md:opacity-0 md:group-hover:opacity-100 z-20"
          aria-label="Add to bag"
        >
          <ShoppingBag className="h-5 w-5" />
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-plum/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase truncate bg-gold/5 px-2 py-0.5 rounded">
            {product.category}
          </p>
          
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-[10px] font-bold text-plum/80">
              {product.rating || "5.0"}
            </span>
          </div>
        </div>

        <h3 className="font-serif text-lg text-plum line-clamp-1 group-hover:text-plum-light transition-colors leading-snug">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xl font-bold text-plum">
            ₦{product.price ? product.price.toLocaleString() : "0"}
          </p>
          {product.review_count > 0 && (
             <span className="text-[10px] text-plum/50 font-bold uppercase tracking-tighter">
                {product.review_count} reviews
             </span>
          )}
        </div>
      </div>
    </div>
  )
})
