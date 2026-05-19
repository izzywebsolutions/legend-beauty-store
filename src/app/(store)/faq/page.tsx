"use client"

import { useState, useEffect } from "react"
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"

export default function FAQPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSiteSettings()
      setSettings(data)
    };
    fetchData();
  }, [])

  return (
    <div className="flex flex-col bg-cream min-h-screen">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl text-plum mb-8 text-center">Frequently Asked Questions</h1>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-plum/10 prose prose-plum max-w-none">
            <div className="whitespace-pre-wrap text-plum/80 leading-relaxed">
               {settings.faqText || "No FAQ information available at the moment. Please contact us for inquiries."}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-plum/60 italic mb-4">Still have questions?</p>
            <a 
              href={`https://wa.me/${settings.whatsappNumber}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-plum text-white px-8 py-3 rounded-full font-semibold hover:bg-plum/90 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
