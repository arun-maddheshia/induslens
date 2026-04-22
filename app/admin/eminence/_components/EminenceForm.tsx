"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import EminenceImageUpload, { EminenceImageEntry } from "./EminenceImageUpload"
import RichTextEditor from "../../_components/RichTextEditor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select"

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
    control,
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
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="Full name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Role / Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("slug", { required: "Role is required" })}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="e.g. CEO, Chanel"
                />
                <p className="mt-1 text-xs text-gray-400">Displayed as the person&apos;s role/title on the page</p>
                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                <input
                  {...register("countryName")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="e.g. United States 🇺🇸"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                <input
                  {...register("language")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="en"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("excerpt", { required: "Excerpt is required" })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors resize-none"
                  placeholder="Short summary of this person's achievements..."
                />
                {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt.message}</p>}
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
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Publishing</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 w-full rounded-lg border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                <input
                  type="number"
                  min={1}
                  {...register("order")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isContent"
                  {...register("isContent")}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="isContent" className="text-sm font-medium text-gray-700">
                  Is Content
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Photo</h2>
            <EminenceImageUpload images={images} onChange={setImages} />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Social Media</h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
                <input
                  {...register("instagramUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Twitter / X</label>
                <input
                  {...register("twitterUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="https://x.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn</label>
                <input
                  {...register("linkedinUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook</label>
                <input
                  {...register("facebookUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                <input
                  {...register("websiteUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving…" : isEdit ? "Update Entry" : "Create Entry"}
        </button>
      </div>
    </form>
  )
}
