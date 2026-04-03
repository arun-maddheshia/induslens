"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"

const statusOptions = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
]

export default function ArticleFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    router.push(`/admin/articles?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current)
    statusDebounceRef.current = setTimeout(() => {
      updateFilters({ status: value, search })
    }, 300)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      updateFilters({ status, search: value })
    }, 400)
  }

  const clearFilters = () => {
    setStatus("")
    setSearch("")
    router.push("/admin/articles")
  }

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current)
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
            placeholder="Search articles..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {statusOptions.map((option) => (
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