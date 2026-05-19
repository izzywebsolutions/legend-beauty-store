"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { Product, ProductVariant } from "@/lib/data"

export interface CartItem extends Product {
  productId: string;
  quantity: number;
  selectedVariant?: ProductVariant;
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void
  removeFromCart: (cartItemId: string) => void // Changed from productId to cartItemId for uniqueness
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("lbs_cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to local storage on cart change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("lbs_cart", JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addToCart = useCallback((product: Product, quantity: number = 1, variant?: ProductVariant) => {
    setCart((prev) => {
      const cartItemId = variant ? `${product.id}-${variant.id}` : product.id
      const existing = prev.find((item) => item.id === cartItemId)
      
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      
      const newItem: CartItem = { 
        ...product, 
        id: cartItemId, // Composite ID for cart uniqueness
        productId: product.id, // Keep original product ID
        quantity, 
        selectedVariant: variant,
        price: variant?.price ?? product.price // Use variant price if available
      }
      return [...prev, newItem]
    })
  }, [])

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId))
  }, [])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = useMemo(() => 
    cart.reduce((total, item) => total + item.price * item.quantity, 0),
  [cart])

  const cartCount = useMemo(() => 
    cart.reduce((count, item) => count + item.quantity, 0),
  [cart])

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    isLoaded,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isLoaded])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
