"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArticleStatus, ContentType } from "@prisma/client"

interface Article {
  id?: string
  headline: string
  alternativeHeadline?: string | null
  excerpt: string
  description?: string | null
  articleBody: string
  pageContent?: string | null
  diveContent?: string | null
  contentType: ContentType
  newsType?: string | null
  category: string
  subCategories: string[]
  genre: string[]
  tags: string[]
  keywords: string[]
  language: string
  metaTitle: string
  metaDescription: string
  slug: string
  url?: string | null
  canonicalUrl?: string | null
  status: ArticleStatus
  visibility: boolean
  publishedAt?: Date | null
  archivedAt?: Date | null
  expiresAt?: Date | null
  agency?: string | null
  publisher?: string | null
  sourceType?: string | null
  siteId?: string | null
  images?: Array<{
    id?: string
    imageCategory: string
    imageCategoryValue?: string | null
    imageDescription?: string | null
    imageUrl: string[]
  }>
}

interface ArticleFormProps {
  article?: Article | null
  isEdit?: boolean
}

export default function ArticleForm({ article, isEdit = false }: ArticleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Article>({
    defaultValues: article || {
      headline: "",
      excerpt: "",
      articleBody: "",
      contentType: ContentType.ARTICLES,
      category: "",
      subCategories: [],
      genre: [],
      tags: [],
      keywords: [],
      language: "en",
      metaTitle: "",
      metaDescription: "",
      slug: "",
      status: ArticleStatus.DRAFT,
      visibility: true,
    },
  })

  const onSubmit = async (data: Article) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/articles/${article?.id}` : "/api/articles"
      const method = isEdit ? "PUT" : "POST"

      // Convert string arrays to proper arrays
      const processedData = {
        ...data,
        tags: typeof data.tags === "string" ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : data.tags,
        keywords: typeof data.keywords === "string" ? data.keywords.split(",").map(k => k.trim()).filter(Boolean) : data.keywords,
        genre: typeof data.genre === "string" ? data.genre.split(",").map(g => g.trim()).filter(Boolean) : data.genre,
        subCategories: typeof data.subCategories === "string" ? data.subCategories.split(",").map(sc => sc.trim()).filter(Boolean) : data.subCategories,
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
        throw new Error(errorData.error || "Failed to save article")
      }

      router.push("/admin/articles")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Generate slug from headline
  const generateSlug = (headline: string) => {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const watchHeadline = watch("headline")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
              Headline *
            </label>
            <input
              {...register("headline", { required: "Headline is required" })}
              type="text"
              onChange={(e) => {
                register("headline").onChange(e)
                if (!isEdit) {
                  setValue("slug", generateSlug(e.target.value))
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.headline && <p className="mt-1 text-sm text-red-600">{errors.headline.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="alternativeHeadline" className="block text-sm font-medium text-gray-700">
              Alternative Headline
            </label>
            <input
              {...register("alternativeHeadline")}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Excerpt *
            </label>
            <textarea
              {...register("excerpt", { required: "Excerpt is required" })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Content</h2>

        <div>
          <label htmlFor="articleBody" className="block text-sm font-medium text-gray-700">
            Article Body *
          </label>
          <textarea
            {...register("articleBody", { required: "Article body is required" })}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.articleBody && <p className="mt-1 text-sm text-red-600">{errors.articleBody.message}</p>}
        </div>

        <div>
          <label htmlFor="pageContent" className="block text-sm font-medium text-gray-700">
            Page Content
          </label>
          <textarea
            {...register("pageContent")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="diveContent" className="block text-sm font-medium text-gray-700">
            Dive Content
          </label>
          <textarea
            {...register("diveContent")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Classification</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
              Content Type
            </label>
            <select
              {...register("contentType")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {Object.values(ContentType).map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="newsType" className="block text-sm font-medium text-gray-700">
              News Type
            </label>
            <input
              {...register("newsType")}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              {...register("category", { required: "Category is required" })}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <input
              {...register("language")}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              {...register("tags")}
              type="text"
              placeholder="tag1, tag2, tag3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
              Keywords (comma-separated)
            </label>
            <input
              {...register("keywords")}
              type="text"
              placeholder="keyword1, keyword2, keyword3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
              Genre (comma-separated)
            </label>
            <input
              {...register("genre")}
              type="text"
              placeholder="genre1, genre2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="subCategories" className="block text-sm font-medium text-gray-700">
              Sub Categories (comma-separated)
            </label>
            <input
              {...register("subCategories")}
              type="text"
              placeholder="subcat1, subcat2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* SEO / Meta */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">SEO / Meta</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
              Meta Title *
            </label>
            <input
              {...register("metaTitle", { required: "Meta title is required" })}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.metaTitle && <p className="mt-1 text-sm text-red-600">{errors.metaTitle.message}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug *
            </label>
            <input
              {...register("slug", { required: "Slug is required" })}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
              Meta Description *
            </label>
            <textarea
              {...register("metaDescription", { required: "Meta description is required" })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.metaDescription && <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              {...register("url")}
              type="url"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700">
              Canonical URL
            </label>
            <input
              {...register("canonicalUrl")}
              type="url"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Publishing */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Publishing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register("status")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {Object.values(ArticleStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              {...register("visibility")}
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="visibility" className="ml-2 block text-sm text-gray-900">
              Visible
            </label>
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
          {isLoading ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
        </button>
      </div>
    </form>
  )
}