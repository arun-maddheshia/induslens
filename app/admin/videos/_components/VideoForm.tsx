"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import VideoImageUpload, { VideoImageEntry } from "./VideoImageUpload"

interface Video {
  id?: string
  name: string
  slug: string
  synopsis?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  contentId: string
  channelId?: string | null
  channelName?: string | null
  duration?: string | null
  contentType?: string | null
  category?: string | null
  genre: string[]
  tags: string[]
  language?: string | null
  author?: string | null
  status: string
  isContent: boolean
  order: number
  images: VideoImageEntry[]
}

interface VideoFormProps {
  video?: Video | null
  isEdit?: boolean
}


function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
}

function parseArrayField(input: string): string[] {
  return input.split(",").map((s) => s.trim()).filter(Boolean)
}

export default function VideoForm({ video, isEdit = false }: VideoFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [images, setImages] = useState<VideoImageEntry[]>(video?.images || [])
  const [genreInput, setGenreInput] = useState((video?.genre || []).join(", "))
  const [tagsInput, setTagsInput] = useState((video?.tags || []).join(", "))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Omit<Video, "images">>({
    defaultValues: {
      name: video?.name || "",
      slug: video?.slug || "",
      synopsis: video?.synopsis || "",
      metaTitle: video?.metaTitle || "",
      metaDescription: video?.metaDescription || "",
      contentId: video?.contentId || "",
      channelId: video?.channelId || "",
      channelName: video?.channelName || "",
      duration: video?.duration || "",
      contentType: video?.contentType || "",
      category: video?.category || "",
      language: video?.language || "en",
      author: video?.author || "",
      status: video?.status || "Published",
      isContent: video?.isContent ?? true,
      order: video?.order || 1,
    },
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value)
    if (!isEdit) setValue("slug", slugify(e.target.value))
  }

  const onSubmit = async (data: Omit<Video, "images">) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/videos/${video?.id}` : "/api/videos"
      const method = isEdit ? "PUT" : "POST"

      const payload = {
        ...data,
        sourceType: "youtube",
        genre: parseArrayField(genreInput),
        tags: parseArrayField(tagsInput),
        order: Number(data.order) || 1,
        isContent: Boolean(data.isContent),
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

      router.push("/admin/videos")
      router.refresh()
    } catch {
      setError("Failed to save video. Please try again.")
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
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                onChange={handleNameChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Video title"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                {...register("slug", { required: "Slug is required" })}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-mono text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="video-slug"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Author</label>
              <input
                {...register("author")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Author or reporter name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Synopsis</label>
              <textarea
                {...register("synopsis")}
                rows={4}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Brief description of the video"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Images
          </h2>
          <VideoImageUpload
            images={images}
            onChange={setImages}
            isIndusTv={watch("category") === "industv"}
          />
        </div>

        {/* Video Source */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Video Source
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                YouTube Video ID <span className="text-red-500">*</span>
              </label>
              <input
                {...register("contentId", { required: "YouTube Video ID is required" })}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-mono text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g. lZeFSG2gbbc"
              />
              {errors.contentId && <p className="mt-1 text-sm text-red-600">{errors.contentId.message}</p>}
              <p className="mt-1 text-xs text-gray-400">
                The ID at the end of a YouTube URL: youtube.com/watch?v=<strong>lZeFSG2gbbc</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Channel ID</label>
              <input
                {...register("channelId")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-mono text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g. Indus_Lens"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Channel Name</label>
              <input
                {...register("channelName")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g. IndusLens"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Duration</label>
              <input
                {...register("duration")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-mono text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g. PT5M30S"
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
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Classification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                id="isIndusTv"
                checked={watch("category") === "industv"}
                onChange={(e) => setValue("category", e.target.checked ? "industv" : "")}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="isIndusTv" className="text-sm font-medium text-gray-700">
                IndusTv Video
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Content Type</label>
              <input
                {...register("contentType")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g. news, short, documentary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Genre <span className="font-normal text-gray-400">(comma-separated)</span>
              </label>
              <input
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="world, news, interview"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Tags <span className="font-normal text-gray-400">(comma-separated)</span>
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="india, climate, sdg"
              />
            </div>
          </div>
        </div>

        {/* SEO / Meta */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
            SEO / Meta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Meta Title</label>
              <input
                {...register("metaTitle")}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="SEO title (defaults to name if empty)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                {...register("slug", { required: "Slug is required" })}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-mono text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Meta Description</label>
              <textarea
                {...register("metaDescription")}
                rows={3}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="SEO description"
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
            {isLoading ? "Saving..." : isEdit ? "Update Video" : "Create Video"}
          </button>
        </div>
      </form>
    </div>
  )
}
