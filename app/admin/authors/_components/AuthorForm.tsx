"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import RichTextEditor from "../../_components/RichTextEditor"
import { resolveStoredImageToUrl } from "@/lib/image-storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select"

interface Author {
  id?: string
  name: string
  aboutTheAnchor: string
  email?: string | null
  slug: string
  description?: string | null
  facebookUrl?: string | null
  linkedinUrl?: string | null
  twitterUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  websiteUrl?: string | null
  authorUrl?: string | null
  contentType: string
  countryName?: string | null
  status: string
  isContent: boolean
  key?: number | null
  siteId?: string | null
  publishedAt?: Date | null
  anchorKey?: string | null
  shows: string[]
  images?: Array<{
    id?: string
    imageCategory: string
    imageCategoryValue?: string | null
    imageDescription?: string | null
    imageUrl: string[]
    key?: string | null
  }>
}

interface AuthorFormProps {
  author?: Author | null
  isEdit?: boolean
}

const authorImageCategories = [
  { value: 'mobileDetailsPageBackground', label: 'Author Profile Image (1:1)', folder: 'mobile-details-background' },
]

export default function AuthorForm({ author, isEdit = false }: AuthorFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Author>({
    defaultValues: author || {
      name: "",
      aboutTheAnchor: "",
      email: "",
      slug: "",
      description: "",
      facebookUrl: "",
      linkedinUrl: "",
      twitterUrl: "",
      instagramUrl: "",
      youtubeUrl: "",
      websiteUrl: "",
      authorUrl: "",
      contentType: "anchor",
      countryName: "",
      status: "Published",
      isContent: true,
      key: null,
      siteId: "",
      anchorKey: "",
      shows: [],
      images: [],
    },
  })

  const aboutTheAnchorRegister = register("aboutTheAnchor", { required: "About the author is required" })

  const onSubmit = async (data: Author) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/authors/${author?.id}` : "/api/authors"
      const method = isEdit ? "PUT" : "POST"

      const processArrayField = (field: any): string[] => {
        if (typeof field === "string") {
          return field.split(",").map((item: string) => item.trim()).filter(Boolean)
        }
        if (Array.isArray(field)) {
          return field
        }
        return []
      }

      const processedData = {
        ...data,
        shows: processArrayField(data.shows),
        key: data.key ? parseInt(data.key.toString()) : null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save author")
      }

      router.push("/admin/authors")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'mobile-details-background')
      formData.append('type', 'authors')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { fileName, filePath } = await response.json()
      const stored =
        (fileName as string) || (filePath ? String(filePath).split("/").filter(Boolean).pop() : "")

      const currentImages = watch("images") || []
      const newImages = [
        ...currentImages.filter(img => img.imageCategoryValue !== 'mobileDetailsPageBackground'),
        {
          imageCategory: 'Small Image (1:1)',
          imageCategoryValue: 'mobileDetailsPageBackground',
          imageDescription: '',
          imageUrl: stored ? [stored] : [],
          key: 'category_0',
        }
      ]

      setValue("images", newImages)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const getCurrentImage = () => {
    const images = watch("images") || []
    return images.find(img => img.imageCategoryValue === 'mobileDetailsPageBackground')
  }

  const currentImage = getCurrentImage()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Author name is required" })}
                  type="text"
                  onChange={(e) => {
                    register("name").onChange(e)
                    if (!isEdit) {
                      setValue("slug", generateSlug(e.target.value))
                    }
                  }}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("slug", { required: "Slug is required" })}
                  type="text"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                <input
                  {...register("countryName")}
                  type="text"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">About</h2>
            <div className="flex flex-col gap-3">
              <RichTextEditor
                label="About the Author"
                value={watch("aboutTheAnchor") || ""}
                onChange={(value) => {
                  setValue("aboutTheAnchor", value)
                  aboutTheAnchorRegister.onChange({ target: { value } })
                }}
                placeholder="Enter detailed information about the author..."
                error={errors.aboutTheAnchor?.message}
                required
              />

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Short Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
                <input
                  {...register("facebookUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
                <input
                  {...register("linkedinUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Twitter URL</label>
                <input
                  {...register("twitterUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instagram URL</label>
                <input
                  {...register("instagramUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">YouTube URL</label>
                <input
                  {...register("youtubeUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Website URL</label>
                <input
                  {...register("websiteUrl")}
                  type="url"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Site</label>
                <Controller
                  control={control}
                  name="siteId"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 w-full rounded-lg border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200">
                        <SelectValue placeholder="— Select Site —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="induslens">IndusLens</SelectItem>
                        <SelectItem value="industales">IndusTales</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Image</h2>

            {currentImage ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={resolveStoredImageToUrl(
                      currentImage.imageUrl[0] || "",
                      "authors",
                      currentImage.imageCategoryValue
                    )}
                    alt="Author profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                >
                  Change Image
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  className="hidden"
                  id="profile-image-input"
                />

                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                ) : (
                  <label
                    htmlFor="profile-image-input"
                    className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Upload image
                  </label>
                )}
              </div>
            )}
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
          {isLoading ? "Saving…" : isEdit ? "Update Author" : "Create Author"}
        </button>
      </div>
    </form>
  )
}
