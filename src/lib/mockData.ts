export interface Product {
   id: string
   name: string
   price: number
   wholesalePrice?: number
   moq?: number // Minimum Order Quantity
   category: string
   description: string
   imageUrl: string
   images: string[]
   inStock: boolean
}

export const CATEGORIES = ["All", "Human Hair", "Hair & Wigs", "Jewelry", "Perfumes", "Accessories", "Cosmetics", "Skincare"]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Lip Gloss",
    price: 15000,
    wholesalePrice: 10000,
    moq: 5,
    category: "Cosmetics",
    description: "A high-shine, non-sticky lip gloss that provides a glass-like finish with a subtle hint of color. Perfect for everyday wear or layering over your favorite lipstick.",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586495778841-8637775ba2bc?q=80&w=800&auto=format&fit=crop"
    ],
    inStock: true
  },
  {
    id: "2",
    name: "Gold Plated Necklace",
    price: 45000,
    wholesalePrice: 30000,
    moq: 3,
    category: "Jewelry",
    description: "Elegant 18k gold-plated necklace featuring a delicate chain and a minimalist pendant. Tarnish-resistant and hypoallergenic.",
    imageUrl: "https://images.unsplash.com/photo-1599643477874-ceed7991471f?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1599643477874-ceed7991471f?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "3",
    name: "Brazilian Body Wave Bundle",
    price: 120000,
    wholesalePrice: 85000,
    moq: 2,
    category: "Human Hair",
    description: "100% human hair body wave bundles. Thick from root to tip, minimal shedding, and can be bleached or dyed. Full luster, bouncy waves.",
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "4",
    name: "Velvet Matte Lipstick",
    price: 18000,
    wholesalePrice: 12000,
    moq: 5,
    category: "Cosmetics",
    description: "Highly pigmented, long-lasting matte lipstick that doesn't dry out your lips. Available in various bold shades.",
    imageUrl: "https://images.unsplash.com/photo-1586495778841-8637775ba2bc?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1586495778841-8637775ba2bc?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "5",
    name: "Hydrating Face Serum",
    price: 25000,
    wholesalePrice: 17000,
    moq: 3,
    category: "Skincare",
    description: "Infused with hyaluronic acid and Vitamin C, this serum deeply hydrates and brightens the skin, leaving a radiant glow.",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "6",
    name: "Diamond Stud Earrings",
    price: 85000,
    wholesalePrice: 60000,
    moq: 2,
    category: "Jewelry",
    description: "Classic faux diamond stud earrings set in sterling silver. Perfect for adding a touch of elegance to any outfit.",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "7",
    name: "Bone Straight Wig — 24\"",
    price: 250000,
    wholesalePrice: 195000,
    moq: 1,
    category: "Hair & Wigs",
    description: "Premium quality bone straight wig. Silky smooth, tangle-free, and pre-plucked for a natural hairline. Swiss lace front.",
    imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "8",
    name: "18-Pan Eyeshadow Palette",
    price: 30000,
    wholesalePrice: 20000,
    moq: 3,
    category: "Cosmetics",
    description: "A versatile palette featuring 18 highly pigmented shades, ranging from warm neutrals to bold shimmers.",
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a1c8ca912066?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1512496015851-a1c8ca912066?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "9",
    name: "Luxury Rose Gold Bracelet",
    price: 55000,
    wholesalePrice: 38000,
    moq: 2,
    category: "Accessories",
    description: "A sophisticated rose gold-plated bracelet with a minimalist charm. Pairs beautifully with any watch or ring.",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "10",
    name: "Chanel Bleu Dupe Eau de Parfum",
    price: 35000,
    wholesalePrice: 22000,
    moq: 5,
    category: "Perfumes",
    description: "An irresistible fresh and woody fragrance for men. Long-lasting 8+ hour projection. 100ml bottle.",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  },
  {
    id: "11",
    name: "Synthetic Curly Wig — 20\"",
    price: 45000,
    wholesalePrice: 30000,
    moq: 3,
    category: "Hair & Wigs",
    description: "Fluffy curly synthetic wig with a natural-looking scalp. Heat-resistant and full density. Pre-styled and ready to wear.",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"],
    inStock: false
  },
  {
    id: "12",
    name: "Designer Silk Scarf",
    price: 22000,
    wholesalePrice: 14000,
    moq: 5,
    category: "Accessories",
    description: "A luxurious 90x90cm silk-feel scarf with a vibrant floral print. Versatile — wear it as a headwrap, neck wrap, or bag accessory.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop"],
    inStock: true
  }
]
