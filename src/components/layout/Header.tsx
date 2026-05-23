"use client"

import Link from "next/link"
import { Search, ShoppingBag, Menu, MessageCircle, X, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useCart } from "@/lib/CartContext"
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"
import { Logo } from "@/components/ui/Logo"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/contact", label: "Contact" },
] as const

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop Products" },
  { href: "/our-story", label: "Our Story" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "Help & FAQ" },
] as const

export function Header() {
  const { cartCount, isLoaded } = useCart()
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        const data = await getSiteSettings()
        if (mounted) setSettings(data)
      } catch (err) {
        console.error("Header: failed to fetch settings", err)
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileMenu()
    }

    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [closeMobileMenu, mobileMenuOpen])

  const storeName = settings?.storeName || "Legend Beauty Store"
  const whatsappUrl = `https://wa.me/${settings?.whatsappNumber || ""}`

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-plum/10 bg-cream/95 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between sm:h-20">
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="rounded-lg p-2 -ml-2 text-plum focus:outline-none focus:ring-2 focus:ring-plum/30"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="flex flex-1 justify-center md:flex-none md:justify-start">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-plum/30"
                onClick={closeMobileMenu}
              >
                <Logo storeName={storeName} className="h-12 w-12 flex-shrink-0 rounded-full border border-plum/10 bg-white object-contain" />
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-bold leading-tight tracking-tight text-plum sm:text-xl md:text-2xl">
                    {storeName}
                  </span>
                  <span className="text-[9px] font-semibold uppercase leading-tight tracking-[0.2em] text-gold sm:text-[10px]">
                    Beauty Redefined
                  </span>
                </div>
              </Link>
            </div>

            <nav className="hidden flex-1 justify-center space-x-8 md:flex" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-1 py-2 text-sm font-medium text-plum/80 transition-colors hover:text-plum focus:outline-none focus:ring-2 focus:ring-plum/30"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-shrink-0 items-center justify-end space-x-3 sm:space-x-4 md:space-x-5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/30 lg:flex"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>

              <button
                type="button"
                className="hidden rounded-lg p-2 text-plum transition-colors hover:text-plum/80 focus:outline-none focus:ring-2 focus:ring-plum/30 sm:block"
              >
                <span className="sr-only">Search</span>
                <Search className="h-5 w-5" aria-hidden="true" />
              </button>

              <Link
                href="/cart"
                className="relative rounded-lg text-plum transition-colors hover:text-plum/80 focus:outline-none focus:ring-2 focus:ring-plum/30"
              >
                <span className="sr-only">Cart</span>
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-plum text-white shadow-sm transition-colors hover:bg-plum-light sm:h-10 sm:w-10">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  {isLoaded && cartCount > 0 ? (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-cream bg-gold text-[10px] font-bold text-plum">
                      {cartCount}
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" id="mobile-navigation">
          <button
            type="button"
            className="fixed inset-0 bg-plum/20 transition-opacity duration-200"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          />
          <div
            className="fixed left-0 top-0 z-50 h-full w-[min(20rem,85vw)] overflow-y-auto bg-cream shadow-xl transition-transform duration-300 ease-out"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="border-b border-plum/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo storeName={storeName} className="h-12 w-12 flex-shrink-0 rounded-full border border-plum/10 bg-white object-contain" />
                  <div className="flex flex-col">
                    <span className="font-serif text-xl font-bold leading-tight text-plum">{storeName}</span>
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.2em] text-gold">Beauty Redefined</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="rounded-lg p-3 -mr-3 text-plum transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-plum/30"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            <nav className="mt-2 space-y-2 p-4" aria-label="Mobile navigation links">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-2xl px-5 py-4 font-bold text-plum/90 transition-all hover:bg-white hover:text-plum active:bg-plum/5 focus:outline-none focus:ring-2 focus:ring-plum/30"
                >
                  <span className="text-base">{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-gold" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-plum/10 bg-white p-6">
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-plum/40">Get in Touch</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 font-bold text-white shadow-lg shadow-green-500/10 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500/30"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Chat on WhatsApp
              </a>
              <div className="mt-6 text-center">
                <p className="text-[11px] font-medium italic text-plum/50">Legend Beauty Store - Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isLoaded && cartCount > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-[45] -translate-x-1/2 md:hidden">
          <Link
            href="/cart"
            className="flex items-center gap-3 rounded-full bg-plum px-6 py-4 text-white shadow-2xl shadow-plum/30 ring-4 ring-white/20 transition-all active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-3 -right-3 flex h-5 w-5 items-center justify-center rounded-full border-2 border-plum bg-gold text-[10px] font-bold text-plum">
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-bold">View Cart</span>
          </Link>
        </div>
      ) : null}
    </>
  )
}
