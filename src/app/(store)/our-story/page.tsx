"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"

export default function OurStoryPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSiteSettings()
      setSettings(data)
    };
    fetchData();
  }, [])

  return (
    <div className="bg-cream">

      {/* Hero Banner */}
      <section className="bg-plum text-white py-24 px-4 text-center">
        <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-3">Who We Are</p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Our Story</h1>
        <p className="text-white/70 max-w-xl mx-auto text-lg">
          Born from a love of beauty and a belief that quality should never come with an impossible price tag.
        </p>
      </section>

      {/* Story Body */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-10">

          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-plum">How It All Began</h2>
            <div className="text-plum/80 text-lg leading-relaxed whitespace-pre-wrap">
              {settings.ourStoryText}
            </div>
          </div>

          <hr className="border-plum/10" />

          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-plum">Our Mission</h2>
            <p className="text-plum/80 text-lg leading-relaxed">
              We believe beauty is an expression of confidence, creativity, and self-love. Our mission is to make premium 
              beauty products accessible to every woman across Nigeria and beyond. We source our products with care, 
              partnering only with trusted suppliers who meet our high standards for quality and safety. Whether you&apos;re 
              shopping retail or in wholesale quantities, every order carries our personal stamp of pride.
            </p>
          </div>

          <hr className="border-plum/10" />

          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-plum">The Legend Promise</h2>
            <p className="text-plum/80 text-lg leading-relaxed">
              From our 100% human hair bundles to our gold-plated jewellery, our handpicked perfumes to our bold cosmetic 
              lines — every item in the Legend Beauty Store collection tells a story of elegance, culture, and 
              unapologetic femininity. We are more than a store. We are a community of women who celebrate each other&apos;s 
              glow, every single day.
            </p>
            <p className="text-plum/80 text-lg leading-relaxed font-medium italic">
              &ldquo;You were born to sparkle. We&apos;re here to help you shine brighter.&rdquo; — The LBS Team
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/shop">Shop the Collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          </div>

        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h2 className="font-serif text-3xl text-plum text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: "✨", title: "Premium Quality", desc: "Every product is vetted for quality, authenticity and performance before it reaches you." },
              { icon: "💰", title: "Affordable Luxury", desc: "You should never have to choose between quality and affordability. We make both possible." },
              { icon: "🚚", title: "Fast Delivery", desc: "Nationwide delivery across Nigeria. Lagos orders arrive in 1–3 business days." },
            ].map((v) => (
              <div key={v.title} className="p-8 rounded-2xl bg-cream border border-plum/10 space-y-3">
                <div className="text-4xl">{v.icon}</div>
                <h3 className="font-serif text-xl text-plum">{v.title}</h3>
                <p className="text-plum/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
