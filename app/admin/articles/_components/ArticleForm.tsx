"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { ArticleStatus, ContentType } from "@prisma/client"
import RichTextEditor from "../../_components/RichTextEditor"
import ImageUpload from "../../_components/ImageUpload"
import { processRichTextImages } from "@/lib/process-rich-text-images"

interface Article {
  id?: string
  headline: string
  alternativeHeadline?: string | null
  excerpt?: string | null
  description?: string | null
  articleBody: string
  pageContent?: string | null
  diveContent?: string | null
  contentType: ContentType
  newsType?: string | null
  category?: string | null
  categoryId?: string | null
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
  authorId?: string | null
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
  const [authors, setAuthors] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [authorsLoading, setAuthorsLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; isNews: boolean }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  /** After `reset()` from server data, skip auto-sync so custom meta title/description are preserved. */
  const suppressMetaAutoSyncRef = useRef(false)
  const suppressMetaAutoSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const META_SYNC_DEBOUNCE_MS = 1000
  const META_SYNC_SUPPRESS_AFTER_RESET_MS = 1100

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    control
  } = useForm<Article>({
    defaultValues: {
      headline: "",
      alternativeHeadline: "",
      excerpt: "",
      articleBody: "",
      contentType: ContentType.ARTICLES,
      images: [],
      category: null,
      categoryId: null,
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
      authorId: null,
    },
  })

  // Fetch authors and categories for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/authors/dropdown'),
          fetch('/api/categories/dropdown')
        ])

        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json()
          setAuthors(authorsData || [])
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData || [])
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error)
      } finally {
        setAuthorsLoading(false)
        setCategoriesLoading(false)
      }
    }

    fetchData()
  }, [])

  // Reset form with article data once authors and categories are loaded (for edit mode)
  useEffect(() => {
    if (!authorsLoading && !categoriesLoading && article) {
      console.log('Resetting form with article data:', article)
      console.log('Article authorId:', article.authorId)
      console.log('Available authors:', authors.map(a => ({ id: a.id, name: a.name })))

      const formData = {
        ...article,
        tags: Array.isArray(article.tags) ? article.tags : [],
        keywords: Array.isArray(article.keywords) ? article.keywords : [],
        genre: Array.isArray(article.genre) ? article.genre : [],
        subCategories: Array.isArray(article.subCategories) ? article.subCategories : [],
        images: Array.isArray(article.images) ? article.images : [],
        // Ensure categoryId is set properly (use categoryId if available, otherwise fall back to category)
        categoryId: article.categoryId || article.category || null,
      }

      console.log('Form data being set:', formData)
      reset(formData)
      suppressMetaAutoSyncRef.current = true
      if (suppressMetaAutoSyncTimerRef.current) {
        clearTimeout(suppressMetaAutoSyncTimerRef.current)
      }
      suppressMetaAutoSyncTimerRef.current = setTimeout(() => {
        suppressMetaAutoSyncRef.current = false
        suppressMetaAutoSyncTimerRef.current = null
      }, META_SYNC_SUPPRESS_AFTER_RESET_MS)
    }
    return () => {
      if (suppressMetaAutoSyncTimerRef.current) {
        clearTimeout(suppressMetaAutoSyncTimerRef.current)
        suppressMetaAutoSyncTimerRef.current = null
      }
    }
  }, [authorsLoading, categoriesLoading, article, reset, authors, categories])

  // Register rich text editor fields for validation
  const pageContentRegister = register("pageContent", { required: "Page content is required" })
  const diveContentRegister = register("diveContent")
  const imagesRegister = register("images")

  const onSubmit = async (data: Article) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/articles/${article?.id}` : "/api/articles"
      const method = isEdit ? "PUT" : "POST"

      // Convert string arrays to proper arrays
      const processArrayField = (field: any): string[] => {
        if (typeof field === "string") {
          return field.split(",").map((item: string) => item.trim()).filter(Boolean)
        }
        if (Array.isArray(field)) {
          return field
        }
        return []
      }

      // Upload any base64 images embedded in the rich text content to S3
      const processedPageContent = data.pageContent
        ? await processRichTextImages(data.pageContent, "articles")
        : data.pageContent

      const processedDiveContent = data.diveContent
        ? await processRichTextImages(data.diveContent, "articles")
        : data.diveContent

      const processedData = {
        ...data,
        pageContent: processedPageContent,
        diveContent: processedDiveContent,
        tags: processArrayField(data.tags),
        keywords: processArrayField(data.keywords),
        genre: processArrayField(data.genre),
        subCategories: processArrayField(data.subCategories),
        // Map categoryId to both fields for backward compatibility
        categoryId: data.categoryId || null,
        category: data.categoryId || null,
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

  const headline = useWatch({ control, name: "headline" })
  const excerpt = useWatch({ control, name: "excerpt" })

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (suppressMetaAutoSyncRef.current) return
      setValue("metaTitle", headline?.trim() ?? "", {
        shouldDirty: false,
        shouldValidate: true,
      })
    }, META_SYNC_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [headline, setValue])

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (suppressMetaAutoSyncRef.current) return
      setValue("metaDescription", excerpt ?? "", {
        shouldDirty: false,
        shouldValidate: true,
      })
    }, META_SYNC_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [excerpt, setValue])

  // Generate slug from headline
  const generateSlug = (headline: string) => {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }


  // Show loading state while data is loading (especially important for edit mode)
  if ((authorsLoading || categoriesLoading) && isEdit) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading form data...</p>
        </div>
      </div>
    )
  }

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
            <label htmlFor="headline" className="block text-sm font-semibold text-gray-800 mb-2">
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
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
            {errors.headline && <p className="mt-1 text-sm text-red-600">{errors.headline.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="alternativeHeadline" className="block text-sm font-semibold text-gray-800 mb-2">
              Alternative Headline
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              {...register("alternativeHeadline")}
              type="text"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-800 mb-2">
              Excerpt
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register("excerpt")}
              id="excerpt"
              rows={3}
              placeholder="Short summary for listings, cards, and previews…"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Content</h2>

        <div>
          <RichTextEditor
            label="Page Content"
            value={watch("pageContent") || ""}
            onChange={(value) => {
              setValue("pageContent", value)
              pageContentRegister.onChange({ target: { value } })
            }}
            placeholder="Enter the main content of the article..."
            error={errors.pageContent?.message}
            required
          />
        </div>

        <div>
          <RichTextEditor
            label="Dive Content"
            value={watch("diveContent") || ""}
            onChange={(value) => {
              setValue("diveContent", value)
              diveContentRegister.onChange({ target: { value } })
            }}
            placeholder="Enter deep-dive content for detailed exploration..."
          />
        </div>

        <div>
          <ImageUpload
            label="Article Images"
            images={watch("images") || []}
            onChange={(images) => {
              setValue("images", images)
              imagesRegister.onChange({ target: { value: images } })
            }}
          />
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Classification</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentType" className="block text-sm font-semibold text-gray-800 mb-2">
              Content Type
            </label>
            <select
              {...register("contentType")}
              disabled
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-500 bg-gray-100 cursor-not-allowed shadow-sm"
            >
              <option value={ContentType.ARTICLES}>ARTICLES</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Content type is fixed to ARTICLES for this form</p>
          </div>

          <div>
            <label htmlFor="newsType" className="block text-sm font-semibold text-gray-800 mb-2">
              News Type
            </label>
            <input
              {...register("newsType")}
              type="text"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-800 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                {...register("categoryId")}
                disabled={categoriesLoading}
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">Select a category (optional)</option>
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className={category.isNews ? 'text-red-700' : 'text-blue-700'}
                  >
                    {category.isNews ? '🔴 ' : '🔵 '}
                    {category.name}
                  </option>
                ))}
                {categories.length === 0 && !categoriesLoading && (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {categoriesLoading && <p className="mt-1 text-xs text-gray-500">Loading categories...</p>}
            {!categoriesLoading && categories.length === 0 && (
              <p className="mt-1 text-xs text-red-500">No categories available. <a href="/admin/categories/new" className="text-indigo-600 hover:text-indigo-800">Create one</a>?</p>
            )}
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <span className="inline-flex items-center">
                🔴 <span className="ml-1 mr-3">News categories</span>
              </span>
              <span className="inline-flex items-center">
                🔵 <span className="ml-1">Content categories</span>
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-semibold text-gray-800 mb-2">
              Language
            </label>
            <input
              {...register("language")}
              type="text"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="authorId" className="block text-sm font-semibold text-gray-800 mb-2">
              Author
            </label>
            <select
              {...register("authorId")}
              disabled={authorsLoading}
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select an author (optional)</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
              {authors.length === 0 && !authorsLoading && (
                <option value="" disabled>No authors available</option>
              )}
            </select>
            {authorsLoading && <p className="mt-1 text-xs text-gray-500">Loading authors...</p>}
            {!authorsLoading && authors.length === 0 && (
              <p className="mt-1 text-xs text-red-500">No authors available. <a href="/admin/authors/new" className="text-indigo-600 hover:text-indigo-800">Create one</a>?</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-800 mb-2">
              Tags (comma-separated)
            </label>
            <input
              {...register("tags")}
              type="text"
              placeholder="tag1, tag2, tag3"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="keywords" className="block text-sm font-semibold text-gray-800 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              {...register("keywords")}
              type="text"
              placeholder="keyword1, keyword2, keyword3"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-semibold text-gray-800 mb-2">
              Genre (comma-separated)
            </label>
            <input
              {...register("genre")}
              type="text"
              placeholder="genre1, genre2"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="subCategories" className="block text-sm font-semibold text-gray-800 mb-2">
              Sub Categories (comma-separated)
            </label>
            <input
              {...register("subCategories")}
              type="text"
              placeholder="subcategory1, subcategory2"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* SEO / Meta */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">SEO / Meta</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-semibold text-gray-800 mb-2">
              Meta Title *
            </label>
            <input
              {...register("metaTitle", { required: "Meta title is required" })}
              type="text"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
            {errors.metaTitle && <p className="mt-1 text-sm text-red-600">{errors.metaTitle.message}</p>}
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

          <div className="md:col-span-2">
            <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-800 mb-2">
              Meta Description *
            </label>
            <textarea
              {...register("metaDescription", { required: "Meta description is required" })}
              rows={3}
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
            {errors.metaDescription && <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-gray-800 mb-2">
              URL
            </label>
            <input
              {...register("url")}
              type="url"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="canonicalUrl" className="block text-sm font-semibold text-gray-800 mb-2">
              Canonical URL
            </label>
            <input
              {...register("canonicalUrl")}
              type="url"
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Publishing */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Publishing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-800 mb-2">
              Status
            </label>
            <select
              {...register("status")}
              className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
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
    </div>
  )
}