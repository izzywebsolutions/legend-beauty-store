"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveLocalProduct, getCategories, Product } from "@/lib/data"
import { supabase, deleteFile } from "@/lib/supabaseClient"
import { ProductCard } from "@/components/product/ProductCard"
import { ProductModal } from "@/components/product/ProductModal"
import { MediaUpload } from "@/components/ui/media-upload"
import { CartProvider } from "@/lib/CartContext"
import { useToast } from "@/components/ui/Toast"
import { ProductOption, ProductVariant } from "@/lib/data/products"
import { IMAGE_FALLBACK } from "@/lib/image-utils"

export default function AddProductPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [wholesalePrice, setWholesalePrice] = useState("")
  const [moq, setMoq] = useState("1")
  const [category, setCategory] = useState("Human Hair")
  const [inStock, setInStock] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [rating, setRating] = useState("5.0")
  const [reviewCount, setReviewCount] = useState("0")
  const [badges, setBadges] = useState<string[]>([])
  const [newBadge, setNewBadge] = useState("")
  const [stockCount, setStockCount] = useState("0")
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [showModalPreview, setShowModalPreview] = useState(false)
  const { toast } = useToast()

  // Derive preview product from current state
  const previewProduct: Product = {
    id: "preview-id",
    name: name || "Product Name",
    description: description || "Detailed product description will appear here.",
    price: price ? parseFloat(price) : 0,
    wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
    moq: moq ? parseInt(moq) : 1,
    category: category || "Category",
    inStock,
    stockCount: parseInt(stockCount) || 0,
    rating: parseFloat(rating) || 5.0,
    review_count: parseInt(reviewCount) || 0,
    badges: badges,
    options: options.length > 0 ? options : undefined,
    variants: variants.length > 0 ? variants : undefined,
    imageUrl: images[0] || IMAGE_FALLBACK,
    images: images.length > 0 ? images : [IMAGE_FALLBACK]
  }

  // Save Validation
  const isValid = name.trim() !== "" && price !== "" && category !== "" && !isSubmitting

  useEffect(() => {
    const fetchData = async () => {
      const cats = await getCategories()
      setCategoryList(cats)
      if (cats.length > 1) {
          setCategory(cats[1]) 
      }
    };
    fetchData();
  }, [])

  const handleUploadSuccess = (url: string, type: 'image' | 'video') => {
    setImages(prev => [...prev, url])
    toast("Image uploaded successfully", "success")
  }

  const removeImage = (indexToRemove: number) => {
     if (window.confirm("Are you sure you want to remove this image?")) {
        const imageToRemove = images[indexToRemove];
        if (imageToRemove && !imageToRemove.includes("images.unsplash.com")) {
          deleteFile(imageToRemove).catch(err => console.error("Error deleting image:", err))
        }
        setImages(images.filter((_, index) => index !== indexToRemove))
     }
  }

  const handleReorder = (draggedIdx: number, targetIdx: number) => {
    const newImages = [...images]
    const [draggedItem] = newImages.splice(draggedIdx, 1)
    newImages.splice(targetIdx, 0, draggedItem)
    setImages(newImages)
  }

  const addBadge = () => {
    if (newBadge.trim() && !badges.includes(newBadge.trim())) {
      setBadges([...badges, newBadge.trim()])
      setNewBadge("")
    }
  }

  const removeBadge = (badgeToRemove: string) => {
    setBadges(badges.filter(b => b !== badgeToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      
      const newProduct: Partial<Product> = {
         name,
         description,
         price: parseFloat(price),
         wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
         moq: parseInt(moq),
         category,
         inStock,
         stockCount: parseInt(stockCount) || 0,
         rating: parseFloat(rating),
         review_count: parseInt(reviewCount),
         badges: badges,
         options: options.length > 0 ? options : undefined,
         variants: variants.length > 0 ? variants : undefined,
         imageUrl: images[0] || "/default-logo.png",
         images: images.length > 0 ? images : ["/default-logo.png"]
      }

      try {
         await saveLocalProduct(newProduct)
         toast("Product saved successfully!", "success")
         router.push("/admin/products")
         router.refresh()
      } catch (err: any) {
         console.error("Save error:", err)
         toast(err.message || "Failed to save product", "error")
      } finally {
         setIsSubmitting(false)
      }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
         <Link href="/admin/products" className="p-2 border border-plum/10 rounded-lg hover:bg-plum/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-plum" />
         </Link>
         <div>
            <h1 className="font-serif text-2xl text-plum">Add New Product</h1>
            <p className="text-sm text-plum/60">Create a new product listing.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Main Forms */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* General Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10 space-y-4">
               <h3 className="font-serif text-lg text-plum mb-4">General Information</h3>
               
               <div>
                  <Label htmlFor="title">Product Name</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Premium Lip Gloss" 
                    className="mt-1" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
               </div>

               <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                     id="description" 
                     rows={4} 
                     className="w-full mt-1 p-3 border border-plum/20 rounded-md focus:outline-none focus:ring-1 focus:ring-plum text-sm"
                     placeholder="Detailed product description..."
                     required
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                  />
               </div>
            </div>

             {/* Pricing and Inventory */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10 space-y-4">
                <h3 className="font-serif text-lg text-plum mb-4">Pricing & Inventory</h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <Label htmlFor="price">Base Price (₦)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        min="0" 
                        placeholder="0.00" 
                        className="mt-1" 
                        required 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                   </div>
                   <div>
                      <Label htmlFor="wholesaleprice">Wholesale Price (₦)</Label>
                      <Input 
                        id="wholesaleprice" 
                        type="number" 
                        min="0" 
                        placeholder="0.00" 
                        className="mt-1" 
                        value={wholesalePrice}
                        onChange={(e) => setWholesalePrice(e.target.value)}
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div>
                      <Label htmlFor="moq">MOQ (Min Order Qty)</Label>
                      <Input 
                        id="moq" 
                        type="number" 
                        min="1" 
                        className="mt-1" 
                        value={moq}
                        onChange={(e) => setMoq(e.target.value)}
                      />
                   </div>
                   <div>
                      <Label htmlFor="stock">Stock Count</Label>
                      <Input 
                        id="stock" 
                        type="number" 
                        min="0" 
                        className="mt-1" 
                        value={stockCount}
                        onChange={(e) => setStockCount(e.target.value)}
                      />
                   </div>
                   <div className="flex items-center gap-2 pt-6">
                      <input 
                        type="checkbox" 
                        id="instock" 
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="h-4 w-4 rounded border-plum/20 text-plum focus:ring-plum" 
                      />
                      <Label htmlFor="instock" className="cursor-pointer">Currently in Stock</Label>
                   </div>
                </div>
             </div>

             {/* Trust Metadata */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10 space-y-4">
              {/* Product Variants Manager */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg text-plum">Product Variants</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setOptions([...options, { name: "", values: [] }])}
                    >
                       <Plus className="h-4 w-4 mr-2" /> Add Option
                    </Button>
                 </div>

                 {options.length > 0 ? (
                    <div className="space-y-6">
                       {options.map((opt, optIdx) => (
                          <div key={optIdx} className="p-4 bg-plum/5 rounded-xl border border-plum/10 space-y-4">
                             <div className="flex items-center gap-4">
                                <div className="flex-1">
                                   <Label className="text-xs">Option Name (e.g. Length)</Label>
                                   <Input 
                                      value={opt.name}
                                      onChange={(e) => {
                                         const newOpts = [...options]
                                         newOpts[optIdx].name = e.target.value
                                         setOptions(newOpts)
                                      }}
                                      placeholder="Size, Color, etc."
                                      className="h-9 mt-1"
                                   />
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-5 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setOptions(options.filter((_, i) => i !== optIdx))}
                                >
                                   <X className="h-4 w-4" />
                                </Button>
                             </div>
                             <div>
                                <Label className="text-xs">Values (comma separated)</Label>
                                <Input 
                                   value={opt.values.join(", ")}
                                   onChange={(e) => {
                                      const newOpts = [...options]
                                      newOpts[optIdx].values = e.target.value.split(",").map(v => v.trim()).filter(v => v !== "")
                                      setOptions(newOpts)
                                   }}
                                   placeholder="12 inch, 14 inch, 16 inch"
                                   className="h-9 mt-1"
                                />
                             </div>
                          </div>
                       ))}

                       <Button 
                          type="button" 
                          className="w-full bg-plum/10 text-plum hover:bg-plum/20 border-none"
                          onClick={() => {
                             const generate = (opts: ProductOption[]): any[] => {
                                if (opts.length === 0) return [{}];
                                const [first, ...rest] = opts;
                                const combinations = generate(rest);
                                return first.values.flatMap(val => 
                                   combinations.map(comb => ({ [first.name]: val, ...comb }))
                                );
                             };

                             const combs = generate(options.filter(o => o.name && o.values.length > 0));
                             const newVariants: ProductVariant[] = combs.map((comb, i) => ({
                                id: `v-${Date.now()}-${i}`,
                                name: Object.values(comb).join(" / "),
                                price: parseFloat(price) || 0,
                                stockCount: 0,
                                options: comb
                             }));
                             setVariants(newVariants);
                             toast(`Generated ${newVariants.length} variants`, "success");
                          }}
                       >
                          Generate Variants List
                       </Button>

                       {variants.length > 0 && (
                          <div className="space-y-4 pt-4 border-t border-plum/10">
                             <h4 className="text-xs font-bold text-plum/60 uppercase tracking-widest">Variants List</h4>
                             <div className="grid grid-cols-1 gap-3">
                                {variants.map((v, vIdx) => (
                                   <div key={v.id} className="flex items-center gap-4 p-3 bg-white border border-plum/10 rounded-xl shadow-sm text-sm">
                                      <div className="flex-1 font-medium text-plum truncate">{v.name}</div>
                                      <div className="w-24">
                                         <Label className="text-[10px]">Price (₦)</Label>
                                         <Input 
                                            type="number" 
                                            value={v.price} 
                                            onChange={(e) => {
                                               const newVs = [...variants]
                                               newVs[vIdx].price = parseFloat(e.target.value) || 0
                                               setVariants(newVs)
                                            }}
                                            className="h-8 text-xs px-2" 
                                         />
                                      </div>
                                      <div className="w-20">
                                         <Label className="text-[10px]">Stock</Label>
                                         <Input 
                                            type="number" 
                                            value={v.stockCount} 
                                            onChange={(e) => {
                                               const newVs = [...variants]
                                               newVs[vIdx].stockCount = parseInt(e.target.value) || 0
                                               setVariants(newVs)
                                            }}
                                            className="h-8 text-xs px-2" 
                                         />
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 ) : (
                    <div className="text-center py-8 px-4 bg-plum/5 rounded-2xl border border-dashed border-plum/20">
                       <p className="text-sm text-plum/40">No variants added yet. Add options like "Size" or "Color" to get started.</p>
                    </div>
                 )}
              </div>

                <h3 className="font-serif text-lg text-plum mb-4">Trust Metadata</h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <Label htmlFor="rating">Star Rating (0-5)</Label>
                      <Input 
                        id="rating" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="5"
                        className="mt-1" 
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      />
                   </div>
                   <div>
                      <Label htmlFor="reviewCount">Review Count</Label>
                      <Input 
                        id="reviewCount" 
                        type="number" 
                        min="0"
                        className="mt-1" 
                        value={reviewCount}
                        onChange={(e) => setReviewCount(e.target.value)}
                      />
                   </div>
                </div>

                <div>
                   <Label>Product Badges</Label>
                   <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="e.g. Best Seller" 
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBadge())}
                      />
                      <Button type="button" onClick={addBadge} size="sm">Add</Button>
                   </div>
                   <div className="flex flex-wrap gap-2 mt-3">
                      {badges.map((badge, idx) => (
                         <span key={idx} className="bg-gold/20 text-plum text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-gold/30">
                            {badge}
                            <button type="button" onClick={() => removeBadge(badge)}>
                               <X className="h-3 w-3 hover:text-red-500" />
                            </button>
                         </span>
                      ))}
                   </div>
                </div>
             </div>
          </div>

         {/* Sidebar Forms */}
         <div className="space-y-8">
            
             {/* Product Organization */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10 space-y-4">
                <h3 className="font-serif text-lg text-plum mb-4">Organization</h3>
                
                <div>
                   <Label htmlFor="category">Category</Label>
                   <select 
                     id="category" 
                     className="w-full mt-1 h-10 px-3 rounded-md border border-plum/20 text-sm focus:outline-none focus:ring-1 focus:ring-plum bg-white"
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                   >
                      {categoryList.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                   </select>
                </div>
             </div>

            {/* Media Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10 space-y-4">
               <h3 className="font-serif text-lg text-plum mb-4">Product Images</h3>
               
               <div className="grid grid-cols-3 gap-3 mb-4">
                  {images.map((img, idx) => (
                     <div 
                       key={idx} 
                       draggable
                       onDragStart={(e) => e.dataTransfer.setData("idx", idx.toString())}
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => {
                         const fromIdx = parseInt(e.dataTransfer.getData("idx"))
                         handleReorder(fromIdx, idx)
                       }}
                       className="relative aspect-square rounded-md overflow-hidden group cursor-move border border-plum/10"
                     >
                        <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow z-10">
                           <X className="h-4 w-4 text-red-500" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-gold text-plum text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            Main
                          </span>
                        )}
                     </div>
                  ))}
               </div>
               
               <MediaUpload 
                 onUploadSuccess={handleUploadSuccess} 
                 accept="image/*" 
                 label="Click or drag image to upload" 
                 maxSize={5} 
               />
               
               <p className="text-xs text-plum/50 text-center mt-2">Upload up to 5 images. Recommended: 800x800px JPG/PNG.</p>
            </div>

         </div>

         {/* Submit Action */}
         <div className="lg:col-span-3 flex justify-end gap-4 border-t border-plum/10 pt-6">
            <Button variant="outline" type="button" asChild>
               <Link href="/admin/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={!isValid}>
               {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
         </div>

      </form>

      {/* LIVE PREVIEW SECTION */}
      <div className="mt-16 pt-10 border-t border-plum/10">
        <h2 className="font-serif text-3xl text-plum mb-2">Live Preview</h2>
        <p className="text-sm text-plum/60 mb-8">See exactly how your product will look on the storefront before saving.</p>
        
        <CartProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-plum/5 rounded-3xl p-8 border border-plum/10">
            
            {/* Card Preview */}
            <div>
              <h3 className="font-semibold text-plum mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse"></span>
                Storefront Card
              </h3>
              <div className="max-w-[280px] bg-white p-4 rounded-2xl shadow-sm border border-plum/10">
                <ProductCard product={previewProduct} />
              </div>
            </div>

            {/* Modal Preview Trigger */}
            <div>
              <h3 className="font-semibold text-plum mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse"></span>
                Full Product Overlay
              </h3>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10 flex flex-col items-start gap-4">
                 <p className="text-sm text-plum/70">Click below to test the full product gallery, description, and WhatsApp checkout integration.</p>
                 <Button type="button" onClick={() => setShowModalPreview(true)} className="bg-plum hover:bg-plum-light text-white">
                    Preview Full Modal
                 </Button>
              </div>
            </div>

          </div>

          {/* Hidden Rendered Modal for Preview */}
          <ProductModal 
            product={showModalPreview ? previewProduct : null} 
            onClose={() => setShowModalPreview(false)} 
          />
        </CartProvider>
      </div>
    </div>
  )
}
