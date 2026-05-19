"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/data"

export function FloatingWhatsApp() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSiteSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  return (
    <a
      href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hello! I'm interested in some of your products.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute right-full mr-3 bg-white text-plum px-3 py-1 rounded-lg text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-plum/10">
        Chat with us
      </span>
    </a>
  )
}
