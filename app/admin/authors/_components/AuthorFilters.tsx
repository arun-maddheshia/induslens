"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function AuthorFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")

  const updateFilters = (newFilters: { search?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove search parameter
    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set("search", newFilters.search)
      } else {
        params.delete("search")
      }
    }

    // Update or remove status parameter
    if (newFilters.status !== undefined) {
      if (newFilters.status) {
        params.set("status", newFilters.status)
      } else {
        params.delete("status")
      }
    }

    // Reset to first page when filters change
    params.delete("page")

    router.push(`/admin/authors?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search })
  }

  const clearFilters = () => {
    setSearch("")
    setStatus("")
    router.push("/admin/authors")
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search authors by name, email, or bio..."
              className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded-r-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              updateFilters({ status: e.target.value })
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div>
          <button
            onClick={clearFilters}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}