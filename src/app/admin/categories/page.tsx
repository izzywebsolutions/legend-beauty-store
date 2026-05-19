"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { getCategories, saveCategories, deleteCategory } from "@/lib/data"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const cats = await getCategories()
      setCategories(cats)
    };
    fetchData();
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    const trimmed = newCategory.trim()
    if (categories.includes(trimmed)) {
        alert("Category already exists")
        return
    }
    
    await saveCategories([trimmed]) // Upsert new one
    const updated = await getCategories()
    setCategories(updated)
    setNewCategory("")
  }

  const handleDeleteCategory = async (name: string) => {
    if (name === "All") return 
    if (confirm(`Are you sure you want to delete "${name}"? This won't delete products, but they will become uncategorized.`)) {
      await deleteCategory(name)
      const updated = await getCategories()
      setCategories(updated)
    }
  }

  const startEditing = (index: number, value: string) => {
    setEditingIndex(index)
    setEditingValue(value)
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditingValue("")
  }

  const saveEdit = async (index: number) => {
    if (!editingValue.trim()) return
    const oldName = categories[index]
    const newName = editingValue.trim()
    
    // First save the new name (upsert)
    await saveCategories([newName])
    
    // Then delete the old name if it's different
    if (oldName !== newName) {
      await deleteCategory(oldName)
    }
    
    const updated = await getCategories()
    setCategories(updated)
    setEditingIndex(null)
    setEditingValue("")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-plum mb-1">Manage Categories</h1>
        <p className="text-sm text-plum/60">Add or remove product categories for your store.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-plum/10">
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="newCategory" className="sr-only">New Category</Label>
            <Input
              id="newCategory"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Skin Care"
              className="w-full"
            />
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-plum/10 overflow-hidden">
        <div className="p-4 bg-cream/30 border-b border-plum/10 font-serif font-bold text-plum">
          Product Categories
        </div>
        <div className="divide-y divide-plum/5">
          {categories.map((cat, index) => (
            <div key={cat} className="p-4 flex items-center justify-between hover:bg-cream/10 transition-colors">
              {editingIndex === index ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <Input 
                    value={editingValue} 
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="h-8 py-1"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(index)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={cancelEditing}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-plum font-medium">{cat} {cat === "All" && <span className="text-[10px] bg-plum/10 px-2 py-0.5 rounded text-plum/60 ml-2 uppercase tracking-wider">Default</span>}</span>
                  <div className="flex items-center gap-2">
                    {cat !== "All" && (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-plum/40 hover:text-plum"
                          onClick={() => startEditing(index, cat)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-plum/40 hover:text-red-500"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
