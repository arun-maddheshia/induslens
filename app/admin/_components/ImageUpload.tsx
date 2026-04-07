"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

interface ImageUploadProps {
  label: string
  images: Array<{
    id?: string
    imageCategory: string
    imageCategoryValue?: string | null
    imageDescription?: string | null
    imageUrl: string[]
  }>
  onChange: (images: Array<{
    id?: string
    imageCategory: string
    imageCategoryValue?: string | null
    imageDescription?: string | null
    imageUrl: string[]
  }>) => void
  error?: string
}

const imageCategories = [
  { value: 'posterImage', label: 'Poster Image (3:2)', folder: 'poster-image' },
  { value: 'detailsPageBackground', label: 'Details Background (1.91:1)', folder: 'details-background' },
  { value: 'mobileDetailsPageBackground', label: 'Mobile Background (1:1)', folder: 'mobile-details-background' },
]

export default function ImageUpload({ label, images, onChange, error }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileUpload = async (file: File, category: typeof imageCategories[0]) => {
    setIsUploading(true)
    setUploadingCategory(category.value)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category.folder)
      formData.append('type', 'articles')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { fileName, filePath } = await response.json()
      const stored = (fileName as string) || (filePath ? String(filePath).split("/").filter(Boolean).pop() : "")

      // Update images array (store filename only; API resolves to S3 URL when serving)
      const existingImageIndex = images.findIndex(img => img.imageCategoryValue === category.value)
      const newImageData = {
        imageCategory: category.label,
        imageCategoryValue: category.value,
        imageDescription: '',
        imageUrl: stored ? [stored] : [],
      }

      let updatedImages
      if (existingImageIndex >= 0) {
        // Replace existing image
        updatedImages = [...images]
        updatedImages[existingImageIndex] = { ...images[existingImageIndex], ...newImageData }
      } else {
        // Add new image
        updatedImages = [...images, newImageData]
      }

      onChange(updatedImages)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
      setUploadingCategory(null)
    }
  }

  const removeImage = (categoryValue: string) => {
    const updatedImages = images.filter(img => img.imageCategoryValue !== categoryValue)
    onChange(updatedImages)
  }

  const getImageForCategory = (categoryValue: string) => {
    return images.find(img => img.imageCategoryValue === categoryValue)
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-4">
        {label}
      </label>

      <div className="space-y-6">
        {imageCategories.map((category) => {
          const existingImage = getImageForCategory(category.value)
          const isCurrentlyUploading = uploadingCategory === category.value

          return (
            <div key={category.value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">{category.label}</h4>
                {existingImage && (
                  <button
                    type="button"
                    onClick={() => removeImage(category.value)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              {existingImage ? (
                <div className="space-y-3">
                  <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={resolveStoredImageToUrl(
                        existingImage.imageUrl[0] || "",
                        "articles",
                        existingImage.imageCategoryValue
                      )}
                      alt={existingImage.imageDescription || category.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={(el) => { fileInputRefs.current[category.value] = el }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, category)
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[category.value]?.click()}
                      disabled={isUploading}
                      className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[category.value] = el }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, category)
                    }}
                    accept="image/*"
                    className="hidden"
                  />

                  {isCurrentlyUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[category.value]?.click()}
                          disabled={isUploading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Upload Image
                        </button>
                        <p className="mt-2 text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}