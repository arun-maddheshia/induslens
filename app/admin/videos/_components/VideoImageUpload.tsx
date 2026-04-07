"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

export interface VideoImageEntry {
  id?: string
  imageCategory: string
  imageCategoryValue?: string | null
  imageDescription?: string | null
  imageUrl: string[]
  key?: string | null
}

interface SlotConfig {
  value: string
  label: string
  hint: string
  folder: string
}

const TRENDING_SLOTS: SlotConfig[] = [
  {
    value: "featuredImage",
    label: "Video Thumbnail",
    hint: "Portrait · 168×302 · Used in the Trending Videos carousel",
    folder: "thumbnail-image",
  },
]

const INDUSTV_SLOTS: SlotConfig[] = [
  {
    value: "detailsPageBackground",
    label: "Details Background",
    hint: "Wide 1.91:1 · Used on homepage grid and social share (OG image)",
    folder: "details-background",
  },
  {
    value: "posterImage",
    label: "Poster Image",
    hint: "Landscape 3:2 · Used in content grid cards",
    folder: "poster-image",
  },
]

interface VideoImageUploadProps {
  images: VideoImageEntry[]
  onChange: (images: VideoImageEntry[]) => void
  isIndusTv?: boolean
}

export default function VideoImageUpload({ images, onChange, isIndusTv = false }: VideoImageUploadProps) {
  const slots = isIndusTv ? INDUSTV_SLOTS : TRENDING_SLOTS
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const getImageForSlot = (slotValue: string) =>
    images.find((img) => img.imageCategoryValue === slotValue)

  const handleFileUpload = async (file: File, slot: SlotConfig) => {
    setUploadingSlot(slot.value)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", slot.folder)
      formData.append("type", "videos")

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")

      const { fileName, filePath } = await res.json()
      const stored =
        (fileName as string) || (filePath ? String(filePath).split("/").filter(Boolean).pop() : "")

      const newEntry: VideoImageEntry = {
        imageCategory: slot.label,
        imageCategoryValue: slot.value,
        imageDescription: "",
        imageUrl: stored ? [stored] : [],
        key: null,
      }

      const existingIdx = images.findIndex((img) => img.imageCategoryValue === slot.value)
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
      setUploadingSlot(null)
    }
  }

  const removeImage = (slotValue: string) => {
    onChange(images.filter((img) => img.imageCategoryValue !== slotValue))
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const existing = getImageForSlot(slot.value)
        const uploading = uploadingSlot === slot.value

        return (
          <div key={slot.value} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-gray-800">{slot.label}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{slot.hint}</p>
              </div>
              {existing && (
                <button
                  type="button"
                  onClick={() => removeImage(slot.value)}
                  className="text-sm text-red-600 hover:text-red-800 ml-4 flex-shrink-0"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={(el) => { fileInputRefs.current[slot.value] = el }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, slot)
                e.target.value = ""
              }}
              className="hidden"
            />

            {existing ? (
              <div className="space-y-3">
                <div
                  className={`relative bg-gray-100 rounded-lg overflow-hidden ${
                    slot.value === "featuredImage" ? "w-40 h-56" : "w-full h-36"
                  }`}
                >
                  <Image
                    src={resolveStoredImageToUrl(
                      existing.imageUrl[0] || "",
                      "videos",
                      existing.imageCategoryValue
                    )}
                    alt={existing.imageDescription || slot.label}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[slot.value]?.click()}
                    disabled={!!uploadingSlot}
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
                      onClick={() => fileInputRefs.current[slot.value]?.click()}
                      disabled={!!uploadingSlot}
                      className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload Image
                    </button>
                    <p className="mt-1 text-xs text-gray-400">
                      {slot.value === "featuredImage"
                        ? "PNG, JPG up to 10MB · Portrait 168×302"
                        : slot.value === "detailsPageBackground"
                        ? "PNG, JPG up to 10MB · Wide 1.91:1"
                        : "PNG, JPG up to 10MB · Landscape 3:2"}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
