"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ProductCard } from "@/components/product/ProductCard"
import { ProductModal } from "@/components/product/ProductModal"
import { Button } from "@/components/ui/Button"
import { getLocalProducts, getSiteSettings, Product, DEFAULT_SETTINGS } from "@/lib/data"
import { handleImageError } from "@/lib/image-utils"
import { openWhatsApp } from "@/lib/whatsapp"
import { RecentlyViewed } from "@/components/product/RecentlyViewed"

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [products, setProducts] = useState<Product[]>([])
  const [activeMedia, setActiveMedia] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const settingsData = await getSiteSettings()
      setSettings(settingsData)

      const productsData = await getLocalProducts()
      setProducts(productsData)
    }
    fetchData()
  }, [])

  // Auto-slide hero media
  useEffect(() => {
    if (settings.heroMedia.length <= 1) return
    const interval = setInterval(() => {
      setActiveMedia(prev => (prev + 1) % settings.heroMedia.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [settings.heroMedia.length])

  const handleJoinWhatsAppCommunity = () => {
    const msg = `Hello ${settings.storeName}! I'd like to join your community and hear about offers & new arrivals.`
    openWhatsApp(settings.whatsappNumber, msg)
  }

  return (
    <div className="flex flex-col">
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProductChange={setSelectedProduct}
      />
      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative h-[600px] lg:h-[800px] overflow-hidden bg-plum">
          {/* Background Media Slider */}
          {settings.heroMedia.map((media, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeMedia ? 'opacity-40' : 'opacity-0'}`}
            >
              {media.type === 'image' ? (
                <Image src={media.url} alt="" fill className="object-cover" priority={idx === 0} loading={idx === 0 ? "eager" : "lazy"} decoding="async" onError={handleImageError} />
              ) : (
                <video src={media.url} autoPlay muted loop className="w-full h-full object-cover" />
              )}
            </div>
          ))}

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center text-white">
            <div className="max-w-3xl">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 italic animate-fade-in">
                {settings.heroHeadline}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl">
                {settings.heroSubtext}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gold hover:bg-gold-light text-plum border-none" asChild>
                  <Link href="/shop">Explore Collection</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                  <Link href="/our-story">Our Story</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Slider Indicators */}
          {settings.heroMedia.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {settings.heroMedia.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMedia(idx)}
                  className={`h-1.5 rounded-full transition-all ${idx === activeMedia ? 'w-8 bg-gold' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
            <span className="text-gold font-semibold tracking-widest uppercase text-sm mb-4 block">Our Story</span>
            <h2 className="font-serif text-4xl text-plum mb-6">Empowering Your Authentic Self</h2>
            <p className="text-plum/80 text-lg leading-relaxed">
              {settings.ourStoryText}
            </p>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-20 bg-cream">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-gold font-semibold tracking-widest uppercase text-sm mb-2 block">Curated For You</span>
                <h2 className="font-serif text-4xl text-plum">New Arrivals</h2>
              </div>
              <Link href="/shop" className="hidden md:block text-plum font-semibold hover:text-plum/80 border-b border-plum pb-1 transition-all">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 8).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={setSelectedProduct}
                />
              ))}
            </div>

            <div className="mt-12 text-center md:hidden">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* WhatsApp CTA Section */}
        <section className="py-24 bg-plum text-white relative overflow-hidden">
          {/* Background Pattern Placeholder */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Join Our Community</h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Get exclusive offers, early access to new arrivals, and personalized beauty advice straight to your phone.
            </p>
            <Button
              size="lg"
              type="button"
              className="font-bold bg-gold hover:bg-gold-light text-white shadow-lg sm:w-auto w-full"
              onClick={handleJoinWhatsAppCommunity}
            >
              Join WhatsApp Channel
            </Button>
          </div>
        </section>

      </main>
    </div>
  )
}
