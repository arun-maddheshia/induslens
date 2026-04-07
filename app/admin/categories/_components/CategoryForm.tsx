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
  createdAt?: string
  updatedAt?: string
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

  // Reset form with category data (for edit mode)
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save category")
      }

      router.push("/admin/categories")
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
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Category Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Name *
              </label>
              <input
                {...register("name", { required: "Name is required", onChange: handleNameChange })}
                type="text"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Enter category name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="id" className="block text-sm font-semibold text-gray-800 mb-2">
                ID *
              </label>
              <input
                {...register("id", { required: "ID is required" })}
                type="text"
                disabled={isEdit}
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Category ID"
              />
              {errors.id && <p className="mt-1 text-sm text-red-600">{errors.id.message}</p>}
              {!isEdit && (
                <p className="mt-1 text-xs text-gray-500">Auto-generated from name. Used for database storage.</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-800 mb-2">
                Slug *
              </label>
              <input
                {...register("slug", { required: "Slug is required" })}
                type="text"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="category-slug"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
              <p className="mt-1 text-xs text-gray-500">Used in URLs. Auto-generated from name.</p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                Description *
              </label>
              <textarea
                {...register("description", { required: "Description is required" })}
                rows={4}
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Enter category description"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-semibold text-gray-800 mb-2">
                Display Order
              </label>
              <input
                {...register("order", {
                  required: "Order is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Order must be at least 1" }
                })}
                type="number"
                min="1"
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="1"
              />
              {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>}
              <p className="mt-1 text-xs text-gray-500">Lower numbers appear first in lists.</p>
            </div>

            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  {...register("isNews")}
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isNews" className="font-semibold text-gray-800">
                  News Category
                </label>
                <p className="text-gray-500">Check if this is a news category. News categories will be highlighted differently.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Preview</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  watch("isNews")
                    ? 'bg-red-100 border-2 border-red-500'
                    : 'bg-blue-100 border-2 border-blue-500'
                }`}
              />
              <span className="font-medium text-gray-900">{watch("name") || "Category Name"}</span>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                watch("isNews")
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {watch("isNews") ? 'News' : 'Content'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {watch("description") || "Category description will appear here"}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              URL: /{watch("slug") || "category-slug"}
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
            {isLoading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  )
}