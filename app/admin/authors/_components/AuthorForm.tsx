"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import RichTextEditor from "../../_components/RichTextEditor"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

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

  // Register rich text editor fields for validation
  const aboutTheAnchorRegister = register("aboutTheAnchor", { required: "About the author is required" })

  const onSubmit = async (data: Author) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/authors/${author?.id}` : "/api/authors"
      const method = isEdit ? "PUT" : "POST"

      // Process shows array
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
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Generate slug from name
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

      // Update images array
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
    <div className="bg-white rounded-xl shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Author Name *
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
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-800 mb-2">
                Slug *
              </label>
              <input
                {...register("slug", { required: "Slug is required" })}
                type="text"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            <div>
              <label htmlFor="countryName" className="block text-sm font-semibold text-gray-800 mb-2">
                Country
              </label>
              <input
                {...register("countryName")}
                type="text"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-800 mb-2">
                Status
              </label>
              <select
                {...register("status")}
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">About</h2>

          <div>
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
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
              Short Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>
        </div>

        {/* Profile Image */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Profile Image</h2>

          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Author Profile Picture</label>

            {currentImage ? (
              <div className="space-y-3">
                <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
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
                <div>
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
                    className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Change Image
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="profile-image-input" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        Upload Profile Image
                      </label>
                      <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Social Media & Links</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="facebookUrl" className="block text-sm font-semibold text-gray-800 mb-2">
                Facebook URL
              </label>
              <input
                {...register("facebookUrl")}
                type="url"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-gray-800 mb-2">
                LinkedIn URL
              </label>
              <input
                {...register("linkedinUrl")}
                type="url"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label htmlFor="twitterUrl" className="block text-sm font-semibold text-gray-800 mb-2">
                Twitter URL
              </label>
              <input
                {...register("twitterUrl")}
                type="url"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label htmlFor="instagramUrl" className="block text-sm font-semibold text-gray-800 mb-2">
                Instagram URL
              </label>
              <input
                {...register("instagramUrl")}
                type="url"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-semibold text-gray-800 mb-2">
                YouTube URL
              </label>
              <input
                {...register("youtubeUrl")}
                type="url"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-semibold text-gray-800 mb-2">
                Website URL
              </label>
              <input
                {...register("websiteUrl")}
                type="url"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : isEdit ? "Update Author" : "Create Author"}
          </button>
        </div>
      </form>
    </div>
  )
}