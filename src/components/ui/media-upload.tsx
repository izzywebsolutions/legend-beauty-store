"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon, Video as VideoIcon } from "lucide-react"
import { uploadFile } from "@/lib/supabaseClient"
import { compressImage } from "@/lib/image-utils"
import Image from "next/image"

interface MediaUploadProps {
  onUploadSuccess: (url: string, type: 'image' | 'video') => void
  accept?: string
  maxSize?: number // in MB
  label?: string
  customFileName?: string
}

export function MediaUpload({
  onUploadSuccess,
  accept = "image/*,video/*,.svg",
  maxSize = 25,
  label = "Upload Media",
  customFileName
}: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ALLOWED_TYPES = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      // Validate size
      if (selectedFile.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB limit.`)
        return
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith('.svg')) {
        setError(`Unsupported file type. Allowed: PNG, JPG, WEBP, SVG, MP4, WEBM.`)
        return
      }

      setFile(selectedFile)

      // Create preview
      const previewUrl = URL.createObjectURL(selectedFile)
      setPreview(previewUrl)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const isVideo = file.type.startsWith("video")
      const isImage = file.type.startsWith("image") && file.type !== 'image/svg+xml'
      
      let fileToUpload = file

      // Phase 1: Compression (for images)
      if (isImage) {
        setUploadProgress(10) 
        fileToUpload = await compressImage(file, 1200, 0.8, 'image/webp')
        setUploadProgress(30)
      }

      // Phase 2: Supabase Upload
      // We simulate the remaining progress since Supabase client doesn't expose progress easily in standard upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) return 95;
          return prev + 5;
        })
      }, 300)

      const url = await uploadFile(fileToUpload, 'products', customFileName)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      onUploadSuccess(url, isVideo ? 'video' : 'image')

      // Reset after success
      setTimeout(() => {
        clearSelection()
      }, 500)
    } catch (err: any) {
      console.error("Upload error:", err)
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setFile(null)
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4 w-full">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-plum/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-plum/5 transition-colors relative"
        >
          <Upload className="h-8 w-8 text-plum/40 mb-3" />
          <p className="text-sm font-medium text-plum">{label}</p>
          <p className="text-xs text-plum/50 mt-1">Supports images & videos up to {maxSize}MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-plum/10 rounded-xl p-4 bg-cream/30 space-y-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 max-w-[80%]">
              {file.type.startsWith("video") ? (
                <VideoIcon className="h-5 w-5 text-plum" />
              ) : (
                <ImageIcon className="h-5 w-5 text-plum" />
              )}
              <span className="text-sm font-medium text-plum truncate flex-1">
                {file.name}
              </span>
            </div>
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="text-plum/50 hover:text-red-500 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="aspect-video relative bg-black/5 rounded-lg overflow-hidden flex items-center justify-center border border-plum/10">
            {preview && (
              file.type.startsWith("video") ? (
                <video src={preview} controls className="max-w-full max-h-full" />
              ) : (
                <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
              )
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {isUploading && (
            <div className="w-full bg-cream rounded-full h-2 overflow-hidden border border-plum/10">
              <div 
                className="bg-gold h-full transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-plum text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-plum-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Confirm Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
