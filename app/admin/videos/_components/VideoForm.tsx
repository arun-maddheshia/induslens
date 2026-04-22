"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import VideoImageUpload, { VideoImageEntry } from "./VideoImageUpload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select"

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
    control,
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
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  onChange={handleNameChange}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="Video title"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("slug", { required: "Slug is required" })}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-mono outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="video-slug"
                />
                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Author</label>
                <input
                  {...register("author")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="Author or reporter name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Synopsis</label>
                <textarea
                  {...register("synopsis")}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors resize-none"
                  placeholder="Brief description of the video"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Images</h2>
            <VideoImageUpload
              images={images}
              onChange={setImages}
              isIndusTv={watch("category") === "industv"}
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">SEO / Meta</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                <input
                  {...register("metaTitle")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="SEO title (defaults to name if empty)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                <textarea
                  {...register("metaDescription")}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors resize-none"
                  placeholder="SEO description"
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
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Video Source</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  YouTube Video ID <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("contentId", { required: "YouTube Video ID is required" })}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-mono outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="e.g. lZeFSG2gbbc"
                />
                {errors.contentId && <p className="mt-1 text-xs text-red-500">{errors.contentId.message}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  The ID at the end of a YouTube URL: youtube.com/watch?v=<strong>lZeFSG2gbbc</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Channel ID</label>
                <input
                  {...register("channelId")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-mono outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="e.g. Indus_Lens"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Channel Name</label>
                <input
                  {...register("channelName")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="e.g. IndusLens"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                <input
                  {...register("duration")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm font-mono outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="e.g. PT5M30S"
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
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Classification</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isIndusTv"
                  checked={watch("category") === "industv"}
                  onChange={(e) => setValue("category", e.target.checked ? "industv" : "")}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="isIndusTv" className="text-sm font-medium text-gray-700">
                  IndusTv Video
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Content Type</label>
                <input
                  {...register("contentType")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="e.g. news, short, documentary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Genre</label>
                <input
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="world, news, interview"
                />
                <p className="mt-1 text-xs text-gray-400">(comma-separated)</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="india, climate, sdg"
                />
                <p className="mt-1 text-xs text-gray-400">(comma-separated)</p>
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
          {isLoading ? "Saving…" : isEdit ? "Update Video" : "Create Video"}
        </button>
      </div>
    </form>
  )
}
