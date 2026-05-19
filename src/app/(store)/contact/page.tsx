"use client"

import { useState, useEffect } from "react"
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/data"
import { Phone, Mail, MapPin, Clock, Truck, CreditCard } from "lucide-react"

export default function ContactPage() {
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
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-5xl text-plum mb-6">Contact & Delivery</h1>
          <p className="text-plum/70 text-lg">
            We are here to help you with any inquiries about our products, orders, or delivery service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Details */}
          <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-plum/10 space-y-10">
            <h2 className="font-serif text-3xl text-plum mb-8 border-b border-plum/10 pb-4">Our Contact Details</h2>
            
            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-plum/5 rounded-2xl flex items-center justify-center text-plum flex-shrink-0">
                     <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-plum mb-1">Our Location</h3>
                     <p className="text-plum/70">{settings.storeAddress}</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-plum/5 rounded-2xl flex items-center justify-center text-plum flex-shrink-0">
                     <Mail className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-plum mb-1">Email Address</h3>
                     <p className="text-plum/70">{settings.storeEmail}</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-plum/5 rounded-2xl flex items-center justify-center text-plum flex-shrink-0">
                     <Phone className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-plum mb-1">WhatsApp / Call</h3>
                     <p className="text-plum/70">+{settings.whatsappNumber}</p>
                     <a 
                       href={`https://wa.me/${settings.whatsappNumber}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-gold font-medium mt-1 inline-block text-sm"
                     >
                       Chat on WhatsApp →
                     </a>
                  </div>
               </div>
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div className="bg-plum text-white p-8 lg:p-12 rounded-3xl shadow-xl space-y-10">
            <h2 className="font-serif text-3xl text-gold mb-8 border-b border-white/10 pb-4">Delivery & Payment</h2>
            
            <div className="space-y-8">
               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-gold flex-shrink-0">
                     <Clock className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-white mb-1">Delivery Time</h3>
                     <p className="text-white/70">{settings.deliveryInfo}</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-gold flex-shrink-0">
                     <Truck className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-white mb-1">Shipping Scope</h3>
                     <p className="text-white/70">{settings.shippingInfo}</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-gold flex-shrink-0">
                     <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-white mb-1">Payment Method</h3>
                     <p className="text-white/70">{settings.paymentInfo}</p>
                  </div>
               </div>
            </div>
          </div>

        </div>

        <div className="mt-24 text-center">
           <p className="text-plum/60 italic mb-6">Legend Beauty Store — Premium quality for legendary women.</p>
        </div>
      </main>
    </div>
  )
}
