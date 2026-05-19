"use client"

import { useState, useEffect } from "react"
import { Product, getProductById } from "@/lib/data"
import { ProductCard } from "./ProductCard"
import { History, Sparkles } from "lucide-react"

export function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      let raw: unknown[]
      try {
        raw = JSON.parse(localStorage.getItem("lbs_recently_viewed") || "[]")
      } catch {
        setLoading(false)
        return
      }

      if (!Array.isArray(raw) || raw.length === 0) {
        setLoading(false)
        return
      }

      // ProductModal persists full product objects; older data may be id strings only.
      const looksLikeProducts = raw.every(
        (item) =>
          item !== null &&
          typeof item === "object" &&
          "id" in (item as object) &&
          "name" in (item as object)
      )

      if (looksLikeProducts) {
        setProducts(raw as Product[])
        setLoading(false)
        return
      }

      try {
        const ids = raw.filter((x): x is string => typeof x === "string")
        const fetched = await Promise.all(ids.map((id) => getProductById(id)))
        setProducts(fetched.filter((p): p is Product => p !== null))
      } catch (e) {
        console.error("Failed to fetch recently viewed", e)
      } finally {
        setLoading(false)
      }
    }

    fetchRecent()
  }, [])

  if (loading || products.length === 0) return null

  return (
    <section className="py-16 bg-cream/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-gold" />
              <span className="text-[10px] font-bold text-plum/40 uppercase tracking-[0.2em]">Based on your interest</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-plum flex items-center gap-3">
              Recently Viewed
              <Sparkles className="h-6 w-6 text-gold animate-pulse" />
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
