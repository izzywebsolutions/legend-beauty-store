"use client"

import { useState, useEffect, useMemo } from "react"
import { ProductCard } from "@/components/product/ProductCard"
import { ProductModal } from "@/components/product/ProductModal"
import { Search, Eye, Filter, ArrowUpDown } from "lucide-react"
import { getLocalProducts, getCategories, Product } from "@/lib/data"
import { handleImageError } from "@/lib/image-utils"

export default function Shop() {
  const [selected, setSelected] = useState("All")
  const [search, setSearch] = useState("")
  const [priceRange, setPriceRange] = useState(500000)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])

  const limit = 12

  // Initial Fetch
  useEffect(() => {
    const fetchCats = async () => {
      const catData = await getCategories()
      setCategories(catData)
    }
    fetchCats()
    
    // Load recently viewed
    const saved = localStorage.getItem('lbs_recently_viewed')
    if (saved) setRecentlyViewed(JSON.parse(saved))
  }, [])

  // Paginated Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const prodData = await getLocalProducts({ 
          limit, 
          offset: page * limit, 
          category: selected === "All" ? undefined : selected 
        })
        
        if (page === 0) {
          setProducts(prodData)
        } else {
          setProducts(prev => [...prev, ...prodData])
        }
        
        setHasMore(prodData.length === limit)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [page, selected])

  // Filter & Sort (Client-side for currently loaded set, but pagination handles the bulk)
  const processedProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
      const matchPrice = p.price <= priceRange
      const matchStock = !inStockOnly || p.inStock === true
      return matchSearch && matchPrice && matchStock
    })

    return list.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (a.created_at && b.created_at) {
         return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })
  }, [products, search, priceRange, inStockOnly, sortBy])

  return (
    <div className="flex flex-col bg-cream min-h-screen">
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onProductChange={setSelectedProduct}
      />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-plum/10 pb-10">
           <div className="space-y-1">
              <h1 className="font-serif text-4xl md:text-5xl text-plum">Our Collection</h1>
              <p className="text-plum/60 font-medium">Explore premium beauty and luxury hair essentials.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input 
                   type="text" 
                   placeholder="Search products..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full bg-white border border-plum/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20 transition-all text-plum placeholder-plum/40 shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-plum/30" />
              </div>
              
              <div className="flex gap-2">
                <select
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="bg-white border border-plum/10 rounded-2xl py-3 px-4 text-sm font-bold text-plum focus:outline-none focus:ring-2 focus:ring-plum/20 shadow-sm cursor-pointer"
                >
                   <option value="newest">Newest</option>
                   <option value="price-low">₦ Low-High</option>
                   <option value="price-high">₦ High-Low</option>
                </select>
              </div>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* Sidebar Filters */}
           <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-28 space-y-10">
                 
                 {/* Categories */}
                 <div className="space-y-5">
                    <h3 className="font-serif text-xl text-plum flex items-center gap-2">
                       <Filter className="h-5 w-5 text-gold" />
                       Categories
                    </h3>
                    <div className="flex flex-wrap lg:flex-col gap-2">
                       <button 
                          onClick={() => { setSelected("All"); setPage(0); }}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                             selected === "All" 
                                ? "bg-plum text-white shadow-lg shadow-plum/20" 
                                : "bg-white text-plum/60 hover:bg-plum/5"
                          }`}
                       >
                          All Collection
                       </button>
                       {categories.filter(c => c !== "All").map((category) => (
                          <button 
                             key={category}
                             onClick={() => { setSelected(category); setPage(0); }}
                             className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                                selected === category 
                                   ? "bg-plum text-white shadow-lg shadow-plum/20" 
                                   : "bg-white text-plum/60 hover:bg-plum/5"
                             }`}
                          >
                             {category}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Price range */}
                 <div className="space-y-5">
                    <h3 className="font-serif text-xl text-plum flex items-center gap-2">
                       <ArrowUpDown className="h-5 w-5 text-gold" />
                       Max Price
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border border-plum/5 shadow-sm space-y-4">
                       <input 
                          type="range" 
                          min="0" 
                          max="500000" 
                          step="10000"
                          value={priceRange}
                          onChange={(e) => setPriceRange(parseInt(e.target.value))}
                          className="w-full accent-plum" 
                       />
                       <div className="flex justify-between font-bold text-plum text-sm">
                          <span>₦0</span>
                          <span>₦{priceRange.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>

                 {/* Availability */}
                 <label className="flex items-center gap-3 cursor-pointer group bg-white p-4 rounded-2xl border border-plum/5 shadow-sm transition-all hover:border-plum/20">
                    <input 
                      type="checkbox" 
                      checked={inStockOnly} 
                      onChange={(e) => setInStockOnly(e.target.checked)} 
                      className="rounded-lg border-plum/20 text-plum focus:ring-plum h-5 w-5"
                    />
                    <span className="text-sm font-bold text-plum/70 group-hover:text-plum">In-Stock Only</span>
                 </label>

              </div>
           </aside>

           {/* Product Grid */}
           <div className="flex-1 space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                 {isLoading && page === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-4 animate-pulse">
                        <div className="aspect-[4/5] bg-plum/5 rounded-3xl" />
                        <div className="h-4 w-1/4 bg-plum/5 rounded-full" />
                        <div className="h-6 w-3/4 bg-plum/5 rounded-full" />
                        <div className="h-4 w-1/3 bg-plum/5 rounded-full" />
                      </div>
                    ))
                 ) : processedProducts.length > 0 ? (
                    processedProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onClick={setSelectedProduct}
                      />
                    ))
                 ) : (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4">
                       <div className="bg-plum/5 p-6 rounded-full">
                          <Search className="h-10 w-10 text-plum/20" />
                       </div>
                       <div>
                          <p className="text-xl font-serif text-plum">No products found</p>
                          <p className="text-plum/50">Try adjusting your filters or search terms.</p>
                       </div>
                    </div>
                 )}
              </div>

              {/* Load More */}
              {!isLoading && hasMore && (
                 <div className="flex justify-center pt-8">
                    <button 
                       onClick={() => setPage(prev => prev + 1)}
                       className="bg-white border-2 border-plum text-plum px-12 py-4 rounded-2xl font-bold hover:bg-plum hover:text-white transition-all shadow-xl shadow-plum/10 active:scale-95"
                    >
                       Load More Collections
                    </button>
                 </div>
              )}

              {isLoading && page > 0 && (
                <div className="flex justify-center py-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum"></div>
                </div>
              )}
           </div>
        </div>

        {/* RECENTLY VIEWED (Page Bottom) */}
        {recentlyViewed.length > 0 && (
          <div className="mt-32 pt-20 border-t border-plum/10">
             <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                   <h2 className="font-serif text-3xl text-plum">Continue Browsing</h2>
                   <p className="text-plum/50 font-medium">Items you recently viewed</p>
                </div>
                <button 
                   onClick={() => { localStorage.removeItem('lbs_recently_viewed'); setRecentlyViewed([]); }}
                   className="text-xs font-bold text-plum/40 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                   Clear History
                </button>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {recentlyViewed.map(p => (
                   <div 
                      key={p.id} 
                      onClick={() => setSelectedProduct(p)}
                      className="group cursor-pointer space-y-3"
                   >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-plum/5 shadow-sm group-hover:shadow-md transition-all">
                         <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" loading="lazy" decoding="async" onError={handleImageError} />
                         <div className="absolute inset-0 bg-plum/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                         <h4 className="text-[11px] font-bold text-plum line-clamp-1 uppercase tracking-tight">{p.name}</h4>
                         <p className="text-sm font-bold text-gold">₦{p.price.toLocaleString()}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

      </main>
    </div>
  )
}
