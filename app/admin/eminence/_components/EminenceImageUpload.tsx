"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

export interface EminenceImageEntry {
  id?: string
  imageCategory: string
  imageCategoryValue?: string | null
  imageDescription?: string | null
  imageUrl: string[]
  key?: string | null
}

interface EminenceImageUploadProps {
  images: EminenceImageEntry[]
  onChange: (images: EminenceImageEntry[]) => void
}

const SLOT = {
  value: "mobileDetailsPageBackground",
  label: "Profile Photo",
  hint: "Square 1:1 · Used on the Indus Eminence listing and detail pages",
  folder: "content-blocks/mobile-details-background",
}

export default function EminenceImageUpload({ images, onChange }: EminenceImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const existing = images.find((img) => img.imageCategoryValue === SLOT.value)

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", SLOT.folder)
      formData.append("type", "eminence")

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")

      const { fileName, filePath } = await res.json()
      const stored =
        (fileName as string) || (filePath ? String(filePath).split("/").filter(Boolean).pop() : "")

      const newEntry: EminenceImageEntry = {
        imageCategory: "Small Image (1:1)",
        imageCategoryValue: SLOT.value,
        imageDescription: "",
        imageUrl: stored ? [stored] : [],
        key: "category_0",
      }

      const existingIdx = images.findIndex((img) => img.imageCategoryValue === SLOT.value)
      if (existingIdx >= 0) {
        const updated = [...images]
        updated[existingIdx] = { ...images[existingIdx], ...newEntry }
        onChange(updated)
      } else {
        onChange([...images, newEntry])
      }
    } catch {
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    onChange(images.filter((img) => img.imageCategoryValue !== SLOT.value))
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium text-gray-800">{SLOT.label}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{SLOT.hint}</p>
        </div>
        {existing && (
          <button
            type="button"
            onClick={removeImage}
            className="text-sm text-red-600 hover:text-red-800 ml-4 flex-shrink-0"
          >
            Remove
          </button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
          e.target.value = ""
        }}
        className="hidden"
      />

      {existing ? (
        <div className="space-y-3">
          <div className="relative w-28 h-28 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={resolveStoredImageToUrl(
                existing.imageUrl[0] || "",
                "eminence",
                existing.imageCategoryValue
              )}
              alt={existing.imageDescription || SLOT.label}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
            >
              {uploading ? "Uploading..." : "Change Image"}
            </button>
            <span className="text-xs text-gray-400 font-mono truncate max-w-[320px]">
              {existing.imageUrl[0]}
            </span>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-10 w-10 text-gray-300"
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Upload Photo
              </button>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 10MB · Square 1:1</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
