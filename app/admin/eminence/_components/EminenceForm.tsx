"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import EminenceImageUpload, { EminenceImageEntry } from "./EminenceImageUpload"
import RichTextEditor from "../../_components/RichTextEditor"

interface EminenceData {
  id?: string
  name: string
  slug: string
  excerpt: string
  pageContent?: string | null
  countryName?: string | null
  language?: string | null
  status: string
  isContent: boolean
  order: number
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  websiteUrl?: string | null
  images: EminenceImageEntry[]
}

interface EminenceFormProps {
  entry?: EminenceData | null
  isEdit?: boolean
}

export default function EminenceForm({ entry, isEdit = false }: EminenceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [images, setImages] = useState<EminenceImageEntry[]>(entry?.images || [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Omit<EminenceData, "images">>({
    defaultValues: {
      name: entry?.name || "",
      slug: entry?.slug || "",
      excerpt: entry?.excerpt || "",
      pageContent: entry?.pageContent || "",
      countryName: entry?.countryName || "",
      language: entry?.language || "en",
      status: entry?.status || "Published",
      isContent: entry?.isContent ?? true,
      order: entry?.order || 1,
      facebookUrl: entry?.facebookUrl || "",
      instagramUrl: entry?.instagramUrl || "",
      twitterUrl: entry?.twitterUrl || "",
      linkedinUrl: entry?.linkedinUrl || "",
      websiteUrl: entry?.websiteUrl || "",
    },
  })

  const onSubmit = async (data: Omit<EminenceData, "images">) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/eminence/${entry?.id}` : "/api/eminence"
      const method = isEdit ? "PUT" : "POST"

      const payload = {
        ...data,
        order: Number(data.order) || 1,
        isContent: Boolean(data.isContent),
        category: "Indus_Eminence",
        images: images.map((img) => ({
          ...img,
          imageUrl: (img.imageUrl || []).filter(Boolean),
        })),
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        setError(errData.error || "An error occurred")
        return
      }

      router.push("/admin/eminence")
      router.refresh()
    } catch {
      setError("Failed to save entry. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Role / Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("slug", { required: "Role is required" })}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g. CEO, Chanel"
              />
              <p className="mt-1 text-xs text-gray-400">Displayed as the person&apos;s role/title on the page</p>
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Country</label>
              <input
                {...register("countryName")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g. United States 🇺🇸"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Language</label>
              <input
                {...register("language")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="en"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("excerpt", { required: "Excerpt is required" })}
                rows={4}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Short summary of this person's achievements..."
              />
              {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>}
            </div>

            <div className="md:col-span-2">
              <RichTextEditor
                label="Page Content"
                value={watch("pageContent") || ""}
                onChange={(value) => setValue("pageContent", value)}
                placeholder="Enter the full content for the detail page..."
              />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Photo
          </h2>
          <EminenceImageUpload images={images} onChange={setImages} />
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Instagram</label>
              <input
                {...register("instagramUrl")}
                type="url"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Twitter / X</label>
              <input
                {...register("twitterUrl")}
                type="url"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="https://x.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">LinkedIn</label>
              <input
                {...register("linkedinUrl")}
                type="url"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Facebook</label>
              <input
                {...register("facebookUrl")}
                type="url"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Website</label>
              <input
                {...register("websiteUrl")}
                type="url"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Publishing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <select
                {...register("status")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Order</label>
              <input
                type="number"
                min={1}
                {...register("order")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="isContent"
                {...register("isContent")}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="isContent" className="ml-2 text-sm font-medium text-gray-700">
                Is Content
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : isEdit ? "Update Entry" : "Create Entry"}
          </button>
        </div>
      </form>
    </div>
  )
}
