"use client"

import Link from "next/link"
import { Search, ShoppingBag, Menu, MessageCircle, X, ChevronRight } from "lucide-react"
import { useCart } from "@/lib/CartContext"
import { useState, useEffect } from "react"
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"
import { Logo } from "@/components/ui/Logo"

export function Header() {
  const { cartCount, isLoaded } = useCart()
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSiteSettings()
        setSettings(data)
        setLogoError(false)
      } catch (err) {
        console.error("Header: failed to fetch settings", err)
      }
    };
    fetchData();
  }, [])

  const storeName = settings?.storeName || "Legend Beauty Store"

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-plum/10 bg-cream/95 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            
            {/* Mobile Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button 
                className="text-plum p-2 -ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open menu</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
   
            {/* Left: Logo + Brand Name + Tagline */}
            <div className="flex justify-center md:justify-start flex-1 md:flex-none">
              <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                <Logo storeName={storeName} className="h-12 w-12 object-contain rounded-full border border-plum/10 bg-white flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-plum leading-tight">
                    {storeName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gold font-semibold tracking-[0.2em] uppercase leading-tight">
                    Beauty Redefined
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-center space-x-8">
              <Link href="/" className="text-sm font-medium text-plum/80 hover:text-plum transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-sm font-medium text-plum/80 hover:text-plum transition-colors">
                Shop
              </Link>
              <Link href="/our-story" className="text-sm font-medium text-plum/80 hover:text-plum transition-colors">
                Our Story
              </Link>
              <Link href="/contact" className="text-sm font-medium text-plum/80 hover:text-plum transition-colors">
                Contact
              </Link>
            </nav>

            {/* Right: Icons & WhatsApp */}
            <div className="flex items-center justify-end space-x-3 sm:space-x-4 md:space-x-5 flex-shrink-0">
              <a 
                href={`https://wa.me/${settings?.whatsappNumber || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>

              <button className="text-plum hover:text-plum/80 transition-colors hidden sm:block">
                <span className="sr-only">Search</span>
                <Search className="h-5 w-5" />
              </button>

              <Link href="/cart" className="relative text-plum hover:text-plum/80 transition-colors">
                <span className="sr-only">Cart</span>
                <div className="bg-plum text-white h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg shadow-sm hover:bg-plum-light transition-colors relative">
                   <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                   {isLoaded && cartCount > 0 && (
                     <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-plum transition-all border-2 border-cream">
                        {cartCount}
                     </span>
                   )}
                </div>
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Faster opacity transition and less blur for mobile perf */}
          <div className="fixed inset-0 bg-plum/20 backdrop-blur-[2px] transition-opacity duration-200" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-80 h-full bg-cream shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out">
            <div className="p-6 border-b border-plum/10 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo storeName={storeName} className="h-12 w-12 object-contain rounded-full border border-plum/10 bg-white flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-serif text-xl font-bold text-plum leading-tight">{storeName}</span>
                    <span className="text-[10px] text-gold font-bold tracking-[0.2em] uppercase leading-tight">Beauty Redefined</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-plum p-3 -mr-3 active:scale-90 transition-transform">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <nav className="p-4 space-y-2 mt-2">
              {[
                { href: "/", label: "Home" },
                { href: "/shop", label: "Shop Products" },
                { href: "/our-story", label: "Our Story" },
                { href: "/contact", label: "Contact Us" },
                { href: "/faq", label: "Help & FAQ" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-4 rounded-2xl text-plum/90 hover:bg-white hover:text-plum font-bold transition-all active:bg-plum/5"
                >
                  <span className="text-base">{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-gold" />
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-plum/10">
              <p className="text-[10px] font-bold text-plum/40 uppercase tracking-[0.2em] mb-4 text-center">Get in Touch</p>
              <a
                href={`https://wa.me/${settings?.whatsappNumber || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-green-500/10 active:scale-[0.98] transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <div className="mt-6 text-center">
                 <p className="text-[11px] text-plum/50 font-medium italic">Legend Beauty Store — Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sticky Mobile Cart Shortcut */}
      {isLoaded && cartCount > 0 && (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[45] animate-bounce-subtle">
           <Link href="/cart" className="flex items-center gap-3 bg-plum text-white px-6 py-4 rounded-full shadow-2xl shadow-plum/40 ring-4 ring-white/20 active:scale-95 transition-all">
              <div className="relative">
                 <ShoppingBag className="h-5 w-5" />
                 <span className="absolute -top-3 -right-3 h-5 w-5 bg-gold text-plum text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-plum">
                    {cartCount}
                 </span>
              </div>
              <span className="font-bold text-sm">View Cart</span>
           </Link>
        </div>
      )}
    </>
  )
}
