"use client"

import { useState, useEffect } from "react"
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"

export default function TermsPage() {
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
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-plum/10">
          <h1 className="font-serif text-4xl text-plum mb-8 text-center">Terms of Service</h1>
          
          <div className="prose prose-plum max-w-none text-plum/80 leading-relaxed space-y-6">
            <p>
              Welcome to <strong>{settings.storeName}</strong>. By accessing or using our website and purchasing our products, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
            </p>
            
            <h2 className="text-2xl font-serif text-plum mt-8 mb-4">1. General Conditions</h2>
            <p>
              We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of our products or services without express written permission by us.
            </p>

            <h2 className="text-2xl font-serif text-plum mt-8 mb-4">2. Products and Pricing</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right to modify or discontinue a product at any time. We have made every effort to display the colors and images of our products as accurately as possible, but we cannot guarantee that your device's display of any color will be completely accurate.
            </p>

            <h2 className="text-2xl font-serif text-plum mt-8 mb-4">3. Orders and Delivery</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All orders are subject to availability and confirmation of the order price.</li>
              <li>Delivery times may vary depending on your location. Our standard delivery policy is: {settings.deliveryInfo}.</li>
              <li>We are not responsible for delays caused by third-party delivery services once the product has been dispatched.</li>
            </ul>

            <h2 className="text-2xl font-serif text-plum mt-8 mb-4">4. Returns and Refunds</h2>
            <p>
              Due to the nature of our products (hair and beauty), returns and exchanges are handled on a case-by-case basis. Please contact us immediately upon receiving your order if there is an issue. Hair that has been altered, washed, or worn cannot be returned under any circumstances for hygiene reasons.
            </p>

            <h2 className="text-2xl font-serif text-plum mt-8 mb-4">5. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to us at:
              <br />
              <strong>Email:</strong> {settings.storeEmail}
              <br />
              <strong>WhatsApp:</strong> +{settings.whatsappNumber}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
