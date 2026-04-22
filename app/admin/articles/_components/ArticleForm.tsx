"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch, Controller } from "react-hook-form"
import { ArticleStatus, ContentType } from "@prisma/client"
import RichTextEditor from "../../_components/RichTextEditor"
import ImageUpload from "../../_components/ImageUpload"
import { processRichTextImages } from "@/lib/process-rich-text-images"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select"

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

  const pageContentRegister = register("pageContent", { required: "Page content is required" })
  const diveContentRegister = register("diveContent")
  const imagesRegister = register("images")

  const onSubmit = async (data: Article) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/articles/${article?.id}` : "/api/articles"
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

  const generateSlug = (headline: string) => {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  if ((authorsLoading || categoriesLoading) && isEdit) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Headline</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Headline <span className="text-red-500">*</span>
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
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
                {errors.headline && <p className="mt-1 text-xs text-red-500">{errors.headline.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Alternative Headline
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  {...register("alternativeHeadline")}
                  type="text"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Excerpt
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  {...register("excerpt")}
                  id="excerpt"
                  rows={3}
                  placeholder="Short summary for listings, cards, and previews…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Content</h2>
            <div className="flex flex-col gap-4">
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

              <RichTextEditor
                label="Dive Content"
                value={watch("diveContent") || ""}
                onChange={(value) => {
                  setValue("diveContent", value)
                  diveContentRegister.onChange({ target: { value } })
                }}
                placeholder="Enter deep-dive content for detailed exploration..."
              />

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

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">SEO / Meta</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Meta Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("metaTitle", { required: "Meta title is required" })}
                  type="text"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                />
                {errors.metaTitle && <p className="mt-1 text-xs text-red-500">{errors.metaTitle.message}</p>}
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
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("metaDescription", { required: "Meta description is required" })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors resize-none"
                />
                {errors.metaDescription && <p className="mt-1 text-xs text-red-500">{errors.metaDescription.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                <input
                  {...register("url")}
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
                        {Object.values(ArticleStatus).map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
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

              <div className="flex items-center gap-2">
                <input
                  {...register("visibility")}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label className="text-sm font-medium text-gray-700">Visible</label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Classification</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className="h-9 w-full rounded-lg border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.isNews ? "🔴 " : "🔵 "}{category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {categoriesLoading && <p className="mt-1 text-xs text-gray-400">Loading categories...</p>}
                {!categoriesLoading && categories.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">No categories available. <a href="/admin/categories/new" className="underline">Create one</a>?</p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <span>🔴 News</span>
                  <span>·</span>
                  <span>🔵 Content</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Author</label>
                <Controller
                  control={control}
                  name="authorId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                      disabled={authorsLoading}
                    >
                      <SelectTrigger className="h-9 w-full rounded-lg border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select an author (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No author</SelectItem>
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {authorsLoading && <p className="mt-1 text-xs text-gray-400">Loading authors...</p>}
                {!authorsLoading && authors.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">No authors available. <a href="/admin/authors/new" className="underline">Create one</a>?</p>
                )}
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
          {isLoading ? "Saving…" : isEdit ? "Update Article" : "Create Article"}
        </button>
      </div>
    </form>
  )
}
