import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/CartContext";

import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <FloatingWhatsApp />
      <Footer />
    </CartProvider>
  );
}
