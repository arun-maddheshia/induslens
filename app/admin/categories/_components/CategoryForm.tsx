"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "")
}

function generateId(name: string) {
  return name
    .replace(/[^a-zA-Z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim()
    .replace(/^_+|_+$/g, "")
}

interface Category {
  id: string
  slug: string
  name: string
  description: string
  isNews: boolean
  order: number
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface CategoryFormData {
  id: string
  slug: string
  name: string
  description: string
  isNews: boolean
  order: number
}

interface CategoryFormProps {
  category?: Category | null
  isEdit?: boolean
}

export default function CategoryForm({ category, isEdit = false }: CategoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      id: "",
      slug: "",
      name: "",
      description: "",
      isNews: false,
      order: 1,
    },
  })

  useEffect(() => {
    if (category && isEdit) {
      reset({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        isNews: category.isNews,
        order: category.order,
      })
    }
  }, [category, isEdit, reset])

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const url = isEdit ? `/api/categories/${category?.id}` : "/api/categories"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save category")
      }

      router.push("/admin/categories")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit) {
      const name = e.target.value
      setValue("id", generateId(name))
      setValue("slug", generateSlug(name))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Category Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required", onChange: handleNameChange })}
                  type="text"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="Enter category name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("id", { required: "ID is required" })}
                    type="text"
                    disabled={isEdit}
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    placeholder="category_id"
                  />
                  {errors.id && <p className="mt-1 text-xs text-red-500">{errors.id.message}</p>}
                  {!isEdit && <p className="mt-1 text-xs text-gray-400">Auto-generated from name</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("slug", { required: "Slug is required" })}
                    type="text"
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                    placeholder="category-slug"
                  />
                  {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
                  <p className="mt-1 text-xs text-gray-400">Used in URLs</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors resize-none"
                  placeholder="Enter category description"
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                <input
                  {...register("order", {
                    required: "Order is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Order must be at least 1" },
                  })}
                  type="number"
                  min="1"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
                  placeholder="1"
                />
                {errors.order && <p className="mt-1 text-xs text-red-500">{errors.order.message}</p>}
                <p className="mt-1 text-xs text-gray-400">Lower numbers appear first</p>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  {...register("isNews")}
                  type="checkbox"
                  id="isNews"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
                />
                <div>
                  <label htmlFor="isNews" className="block text-xs font-medium text-gray-700 cursor-pointer">
                    News Category
                  </label>
                  <p className="text-xs text-gray-400 mt-0.5">Mark as a news category (highlighted differently)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Preview</h2>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    watch("isNews") ? "bg-red-400" : "bg-blue-400"
                  }`}
                />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {watch("name") || "Category Name"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    watch("isNews")
                      ? "bg-red-50 text-red-700 ring-red-200"
                      : "bg-blue-50 text-blue-700 ring-blue-200"
                  }`}
                >
                  {watch("isNews") ? "News" : "Content"}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">
                {watch("description") || "Category description will appear here"}
              </p>
              <p className="mt-1.5 text-xs text-gray-400">/{watch("slug") || "category-slug"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="h-9 px-4 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
        </button>
      </div>
    </form>
  )
}
