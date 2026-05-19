"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Send, Youtube } from "lucide-react"
import { useState, useEffect } from "react"
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"
import { Logo } from "@/components/ui/Logo"

// TikTok doesn't have a lucide icon — using a simple SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
    </svg>
  )
}

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSiteSettings()
        setSettings(data)
      } catch (err) {
        console.error("Footer: failed to fetch settings", err)
      }
    };
    fetchData();
  }, [])

  return (
    <footer className="bg-plum text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-2 flex-shrink-0 transition-transform hover:scale-105">
              {/* Logo Image */}
              <Logo storeName={settings.storeName} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border border-plum/10 bg-white flex-shrink-0" />
              {/* Brand Text */}
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                  {settings.storeName}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gold font-semibold tracking-[0.2em] uppercase leading-tight">
                  Beauty Redefined
                </span>
              </div>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              {settings.heroSubtext}
            </p>
            {/* Social Icons */}
            <div className="flex flex-wrap gap-4 pt-2">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.xUrl && (
                <a href={settings.xUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors" aria-label="Twitter / X">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors" aria-label="TikTok">
                  <TikTokIcon className="h-5 w-5" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {/* WhatsApp */}
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors" aria-label="WhatsApp">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413A11.815 11.815 0 0 0 12.05 0zm0 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z"/>
                </svg>
              </a>
              {/* Telegram */}
              {settings.telegramLink && (
                <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors" aria-label="Telegram">
                  <Send className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="font-semibold text-gold tracking-wider uppercase text-sm mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-white/80 hover:text-white text-sm transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?category=Human+Hair" className="text-white/80 hover:text-white text-sm transition-colors">Human Hair</Link></li>
              <li><Link href="/shop?category=Hair+%26+Wigs" className="text-white/80 hover:text-white text-sm transition-colors">Wigs</Link></li>
              <li><Link href="/shop?category=Jewelry" className="text-white/80 hover:text-white text-sm transition-colors">Jewellery</Link></li>
              <li><Link href="/shop?category=Perfumes" className="text-white/80 hover:text-white text-sm transition-colors">Perfumes</Link></li>
              <li><Link href="/shop?category=Accessories" className="text-white/80 hover:text-white text-sm transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="font-semibold text-gold tracking-wider uppercase text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/our-story" className="text-white/80 hover:text-white text-sm transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-white/80 hover:text-white text-sm transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-white/80 hover:text-white text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact + Delivery Col */}
          <div>
            <h3 className="font-semibold text-gold tracking-wider uppercase text-sm mb-4">Contact & Delivery</h3>
            <address className="not-italic text-sm text-white/80 space-y-2">
              <p>📍 {settings.storeAddress}</p>
              <p>
                <a href={`mailto:${settings.storeEmail}`} className="hover:text-white transition-colors">
                  ✉ {settings.storeEmail}
                </a>
              </p>
               <p>
                 <a href={`https://wa.me/${settings.whatsappNumber}`} className="hover:text-white transition-colors">
                   📱 {settings.whatsappNumber}
                 </a>
               </p>
              <div className="pt-2 space-y-1 text-white/60">
                <p>🚚 Delivery: {settings.deliveryInfo}</p>
                <p>📦 {settings.shippingInfo}</p>
                <p>💳 Payment: {settings.paymentInfo}</p>
              </div>
            </address>
          </div>

        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
           <p className="text-sm text-white/60">
             {settings.footerText}
           </p>
          <div className="flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0">
            <a 
              href={settings.poweredByLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-white/40 hover:text-gold transition-colors italic"
            >
              {settings.poweredByText}
            </a>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
