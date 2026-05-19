"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { getLocalProducts, deleteLocalProduct, getCategories, Product } from "@/lib/data"
import { Plus, Search, Edit, Trash2 } from "lucide-react"

export default function AdminProductsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [status, setStatus] = useState("Status: All")
  const [localProducts, setLocalProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const limit = 10

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [prodData, catData] = await Promise.all([
          getLocalProducts({ limit, offset: page * limit, category: category === "All Categories" ? undefined : category }),
          getCategories()
        ]);
        setLocalProducts(prodData);
        setCategories(catData);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, [page, category])

  const filteredProducts = localProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === "Status: All" || 
                       (status === "Out of Stock" && !p.inStock) || 
                       (status === "Active" && p.inStock)
    return matchSearch && matchStatus
  })

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setIsLoading(true)
      try {
        await deleteLocalProduct(id)
        const data = await getLocalProducts({ limit, offset: page * limit, category: category === "All Categories" ? undefined : category })
        setLocalProducts(data)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="font-serif text-3xl text-plum mb-1">Products</h1>
            <p className="text-sm text-plum/60">Manage your store catalog and inventory.</p>
         </div>
          <Button className="shrink-0" asChild>
             <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
             </Link>
          </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-plum/10">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum/50" />
            <Input 
               placeholder="Search currently loaded products..." 
               className="pl-9 h-10 border-plum/20" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select 
               className="h-10 px-3 rounded-md border border-plum/20 text-sm text-plum bg-white focus:outline-none focus:ring-1 focus:ring-plum"
               value={category}
               onChange={(e) => {
                 setCategory(e.target.value)
                 setPage(0)
               }}
            >
               <option>All Categories</option>
               {categories.filter(c => c !== "All").map(c => (
                  <option key={c}>{c}</option>
               ))}
            </select>
            <select 
               className="h-10 px-3 rounded-md border border-plum/20 text-sm text-plum bg-white focus:outline-none focus:ring-1 focus:ring-plum"
               value={status}
               onChange={(e) => setStatus(e.target.value)}
            >
               <option>Status: All</option>
               <option>Active</option>
               <option>Out of Stock</option>
            </select>
          </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-plum/10 overflow-hidden relative">
         {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum"></div>
            </div>
         )}
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-plum/60 uppercase bg-cream/50 border-b border-plum/10">
                  <tr>
                     <th className="px-6 py-4 font-medium">Product</th>
                     <th className="px-6 py-4 font-medium">Category</th>
                     <th className="px-6 py-4 font-medium">Price</th>
                     <th className="px-6 py-4 font-medium">Stock</th>
                     <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-plum/5">
                   {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-cream/20 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-lg bg-cream overflow-hidden shrink-0 border border-plum/10 relative">
                                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                               </div>
                               <div>
                                  <p className="font-medium text-plum line-clamp-1">{product.name}</p>
                                  <p className="text-xs text-plum/50 mt-0.5">ID: {product.id.substring(0, 8)}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-plum/5 text-plum">
                               {product.category}
                            </span>
                         </td>
                         <td className="px-6 py-4 font-medium text-plum">
                            ₦{product.price.toLocaleString()}
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                               <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-plum/60 hover:text-plum" asChild>
                                   <Link href={`/admin/products/${product.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                   </Link>
                                </Button>
                                <button 
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="p-2 text-plum/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                   <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                         </td>
                      </tr>
                    ))
                   ) : (
                    <tr>
                       <td colSpan={5} className="px-6 py-12 text-center text-plum/50 italic">
                          No products found in this page.
                       </td>
                    </tr>
                   )}
               </tbody>
            </table>
         </div>
         
         {/* Real Pagination */}
          <div className="px-6 py-4 border-t border-plum/10 flex items-center justify-between text-sm text-plum/60">
             <span>Page {page + 1}</span>
            <div className="flex gap-2">
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}
               >
                 Previous
               </Button>
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={localProducts.length < limit || isLoading}
               >
                 Next
               </Button>
            </div>
          </div>
      </div>

    </div>
  )
}
