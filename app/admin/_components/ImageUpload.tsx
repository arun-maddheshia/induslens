"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

interface ImageEntry {
  id?: string
  imageCategory: string
  imageCategoryValue?: string | null
  imageDescription?: string | null
  imageUrl: string[]
}

interface ImageUploadProps {
  label: string
  images: ImageEntry[]
  onChange: (images: ImageEntry[]) => void
  error?: string
}

const imageCategories = [
  { value: "posterImage",                label: "Poster Image (3:2)",           folder: "poster-image" },
  { value: "detailsPageBackground",      label: "Details Background (1.91:1)",  folder: "details-background" },
  { value: "mobileDetailsPageBackground",label: "Mobile Background (1:1)",      folder: "mobile-details-background" },
]

export default function ImageUpload({ label, images, onChange, error }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)
  const [draggingOver, setDraggingOver] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileUpload = async (file: File, category: typeof imageCategories[0]) => {
    setIsUploading(true)
    setUploadingCategory(category.value)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category.folder)
      formData.append("type", "articles")

      const response = await fetch("/api/upload", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Upload failed")

      const { fileName, filePath } = await response.json()
      const stored = (fileName as string) || (filePath ? String(filePath).split("/").filter(Boolean).pop() : "")

      const existingIndex = images.findIndex(img => img.imageCategoryValue === category.value)
      const newEntry: ImageEntry = {
        imageCategory: category.label,
        imageCategoryValue: category.value,
        imageDescription: "",
        imageUrl: stored ? [stored] : [],
      }

      const updated = [...images]
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...images[existingIndex], ...newEntry }
      } else {
        updated.push(newEntry)
      }
      onChange(updated)
    } catch {
      alert("Failed to upload image")
    } finally {
      setIsUploading(false)
      setUploadingCategory(null)
    }
  }

  const removeImage = (categoryValue: string) =>
    onChange(images.filter(img => img.imageCategoryValue !== categoryValue))

  const getImage = (categoryValue: string) =>
    images.find(img => img.imageCategoryValue === categoryValue)

  const handleDrop = (e: React.DragEvent, category: typeof imageCategories[0]) => {
    e.preventDefault()
    setDraggingOver(null)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file, category)
    }
  }

  const handleDragOver = (e: React.DragEvent, categoryValue: string) => {
    e.preventDefault()
    setDraggingOver(categoryValue)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggingOver(null)
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-3">{label}</label>

      <div className="flex flex-col gap-3">
        {imageCategories.map((category) => {
          const existing = getImage(category.value)
          const uploading = uploadingCategory === category.value
          const isDragTarget = draggingOver === category.value

          return (
            <div key={category.value} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">{category.label}</span>
                {existing && (
                  <button
                    type="button"
                    onClick={() => removeImage(category.value)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>

              {existing ? (
                <div
                  className={`relative w-full h-28 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed transition-colors ${isDragTarget ? "border-gray-400 bg-gray-50" : "border-transparent"}`}
                  onDragOver={(e) => handleDragOver(e, category.value)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category)}
                >
                  <Image
                    src={resolveStoredImageToUrl(
                      existing.imageUrl[0] || "",
                      "articles",
                      existing.imageCategoryValue
                    )}
                    alt={existing.imageDescription || category.label}
                    fill
                    className="object-cover"
                  />
                  {isDragTarget && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <p className="text-sm font-medium text-white">Drop to replace</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => { fileInputRefs.current[category.value] = el }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, category) }}
                    className="hidden"
                  />
                  {!isDragTarget && (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[category.value]?.click()}
                      disabled={isUploading}
                      className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-50"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                    isDragTarget
                      ? "border-gray-400 bg-gray-50"
                      : uploading
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                  onDragOver={(e) => handleDragOver(e, category.value)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category)}
                  onClick={() => !isUploading && fileInputRefs.current[category.value]?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => { fileInputRefs.current[category.value] = el }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, category) }}
                    className="hidden"
                  />

                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                      <p className="text-xs text-gray-500">Uploading…</p>
                    </>
                  ) : isDragTarget ? (
                    <>
                      <Upload className="h-5 w-5 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600">Drop to upload</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-gray-300" />
                      <p className="text-xs text-gray-400">
                        Drop image here or <span className="font-medium text-gray-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-300">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
