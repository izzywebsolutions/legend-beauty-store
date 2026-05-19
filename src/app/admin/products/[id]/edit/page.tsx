"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLocalProducts, saveLocalProduct, getCategories, Product, getProductById } from "@/lib/data"
import { supabase, deleteFile } from "@/lib/supabaseClient"
import { Upload, X, ChevronLeft, Save } from "lucide-react"
import { ProductCard } from "@/components/product/ProductCard"
import { ProductModal } from "@/components/product/ProductModal"
import { MediaUpload } from "@/components/ui/media-upload"
import { CartProvider } from "@/lib/CartContext"
import { useToast } from "@/components/ui/Toast"
import { IMAGE_FALLBACK } from "@/lib/image-utils"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [categories, setCategories] = useState<string[]>([])
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    wholesalePrice: 0,
    moq: 1,
    category: "Human Hair",
    inStock: true,
    stockCount: 0,
    imageUrl: "",
    images: [],
    rating: 5.0,
    review_count: 0,
    badges: []
  })
  
  const [newBadge, setNewBadge] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModalPreview, setShowModalPreview] = useState(false)
  const { toast } = useToast()

  // Derive preview product
  const previewProduct: Product = {
    ...formData,
    id: productId || "preview-id",
    name: formData.name || "Product Name",
    description: formData.description || "Detailed product description will appear here.",
    category: formData.category || "Category",
    imageUrl: formData.images[0] || IMAGE_FALLBACK,
    images: formData.images.length > 0 ? formData.images : [IMAGE_FALLBACK]
  }

  // Save Validation
  const isValid = formData.name.trim() !== "" && formData.price >= 0 && formData.category !== "" && !isSubmitting

  useEffect(() => {
    const fetchData = async () => {
      const [cats, product] = await Promise.all([
        getCategories(),
        getProductById(productId)
      ]);
      setCategories(cats);
      if (product) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = product
        setFormData(rest)
      } else {
        router.push("/admin/products")
      }
    };
    fetchData();
  }, [productId, router])

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUploadSuccess = (url: string, type: 'image' | 'video') => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url],
      imageUrl: prev.imageUrl || url
    }))
    toast("Image uploaded and optimized", "success")
  }

  const removeImage = (index: number) => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      const imageToRemove = formData.images[index];
      if (imageToRemove && !imageToRemove.includes("images.unsplash.com")) {
        deleteFile(imageToRemove).catch(err => console.error("Error deleting image:", err))
      }

      setFormData(prev => {
        const newImages = prev.images.filter((_, i) => i !== index)
        return {
          ...prev,
          images: newImages,
          imageUrl: newImages[0] || ""
        }
      })
    }
  }

  const handleReorder = (draggedIdx: number, targetIdx: number) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      const [draggedItem] = newImages.splice(draggedIdx, 1)
      newImages.splice(targetIdx, 0, draggedItem)
      return {
        ...prev,
        images: newImages,
        imageUrl: newImages[0]
      }
    })
  }

  const addBadge = () => {
    if (newBadge.trim() && !formData.badges.includes(newBadge.trim())) {
      handleFieldChange("badges", [...formData.badges, newBadge.trim()])
      setNewBadge("")
    }
  }

  const removeBadge = (badgeToRemove: string) => {
    handleFieldChange("badges", formData.badges.filter(b => b !== badgeToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const completeProduct: Product = {
      ...formData,
      id: productId,
    }
    try {
      await saveLocalProduct(completeProduct)
      toast("Product updated successfully", "success")
      router.push("/admin/products")
      router.refresh()
    } catch (err: any) {
      console.error("Update error:", err)
      toast(err.message || "Failed to update product", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-3xl text-plum">Edit Product</h1>
        </div>
        <Button onClick={handleSubmit} disabled={!isValid}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Updating..." : "Update Product"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10">
            <Label className="text-plum font-serif text-lg mb-4 block">Product Images</Label>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {formData.images.map((img, index) => (
                <div 
                  key={index} 
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("idx", index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const fromIdx = parseInt(e.dataTransfer.getData("idx"))
                    handleReorder(fromIdx, index)
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-cream border border-plum/10 group cursor-move"
                >
                  <Image src={img} alt={`Product ${index}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-gold text-plum text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <MediaUpload 
              onUploadSuccess={handleUploadSuccess} 
              accept="image/*" 
              label="Click or drag image" 
              maxSize={5} 
            />

            <p className="text-[10px] text-plum/50 italic mt-2">The first image will be the primary product photo.</p>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-plum/10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleFieldChange("name", e.target.value)} className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category" 
                  value={formData.category} 
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full mt-1 h-10 px-3 border border-plum/20 rounded-md focus:outline-none focus:ring-1 focus:ring-plum text-sm bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="inStock">Stock Status</Label>
                <select 
                  id="inStock" 
                  value={formData.inStock ? "true" : "false"} 
                  onChange={(e) => handleFieldChange("inStock", e.target.value === "true")}
                  className="w-full mt-1 h-10 px-3 border border-plum/20 rounded-md focus:outline-none focus:ring-1 focus:ring-plum text-sm bg-white"
                >
                   <option value="true">In Stock</option>
                   <option value="false">Out of Stock</option>
                </select>
              </div>

              <div>
                <Label htmlFor="price">Retail Price (₦)</Label>
                <Input id="price" type="number" value={formData.price} onChange={(e) => handleFieldChange("price", Number(e.target.value))} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="wholesalePrice">Wholesale Price (₦)</Label>
                <Input id="wholesalePrice" type="number" value={formData.wholesalePrice} onChange={(e) => handleFieldChange("wholesalePrice", Number(e.target.value))} className="mt-1" />
              </div>

               <div>
                <Label htmlFor="moq">MOQ (for Wholesale)</Label>
                <Input id="moq" type="number" min={1} value={formData.moq} onChange={(e) => handleFieldChange("moq", Number(e.target.value))} className="mt-1" />
              </div>
            </div>

            {/* Trust Metadata Section */}
            <div className="pt-6 border-t border-plum/10 space-y-6">
              <Label className="text-plum font-serif text-lg block">Trust Metadata</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="rating">Star Rating (0-5)</Label>
                  <Input 
                    id="rating" 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="5"
                    value={formData.rating} 
                    onChange={(e) => handleFieldChange("rating", Number(e.target.value))} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="review_count">Review Count</Label>
                  <Input 
                    id="review_count" 
                    type="number" 
                    min="0"
                    value={formData.review_count} 
                    onChange={(e) => handleFieldChange("review_count", Number(e.target.value))} 
                    className="mt-1" 
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
                  <Button type="button" onClick={addBadge}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.badges.map((badge, idx) => (
                    <span key={idx} className="bg-gold/20 text-plum text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 border border-gold/30">
                      {badge}
                      <button type="button" onClick={() => removeBadge(badge)}>
                        <X className="h-3 w-3 hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Product Description</Label>
              <textarea 
                id="description" 
                rows={5} 
                value={formData.description} 
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="w-full mt-1 p-3 border border-plum/20 rounded-md focus:outline-none focus:ring-1 focus:ring-plum text-sm"
              />
            </div>
          </div>
        </div>
      </div>

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
