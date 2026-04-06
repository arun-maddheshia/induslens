"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"

const categoryTypeOptions = [
  { value: "", label: "All Categories" },
  { value: "true", label: "News Categories" },
  { value: "false", label: "Content Categories" },
]

export default function CategoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [isNews, setIsNews] = useState(searchParams.get("isNews") || "")

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    params.delete("page")

    router.push(`/admin/categories?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      updateFilters({ search: value, isNews })
    }, 400)
  }

  const handleTypeChange = (value: string) => {
    setIsNews(value)
    if (typeDebounceRef.current) clearTimeout(typeDebounceRef.current)
    typeDebounceRef.current = setTimeout(() => {
      updateFilters({ search, isNews: value })
    }, 300)
  }

  const clearFilters = () => {
    setSearch("")
    setIsNews("")
    router.push("/admin/categories")
  }

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      if (typeDebounceRef.current) clearTimeout(typeDebounceRef.current)
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, description, or slug..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="isNews" className="block text-sm font-medium text-gray-700 mb-1">
            Category Type
          </label>
          <select
            id="isNews"
            value={isNews}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {categoryTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}