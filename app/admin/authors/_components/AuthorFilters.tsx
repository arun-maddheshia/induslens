"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"

export default function AuthorFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [siteId, setSiteId] = useState(searchParams.get("siteId") || "")

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateFilters = (newFilters: { search?: string; status?: string; siteId?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set("search", newFilters.search)
      } else {
        params.delete("search")
      }
    }

    if (newFilters.status !== undefined) {
      if (newFilters.status) {
        params.set("status", newFilters.status)
      } else {
        params.delete("status")
      }
    }

    if (newFilters.siteId !== undefined) {
      if (newFilters.siteId) {
        params.set("siteId", newFilters.siteId)
      } else {
        params.delete("siteId")
      }
    }

    params.delete("page")
    router.push(`/admin/authors?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      updateFilters({ search: value, status, siteId })
    }, 400)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current)
    statusDebounceRef.current = setTimeout(() => {
      updateFilters({ search, status: value, siteId })
    }, 300)
  }

  const handleSiteChange = (value: string) => {
    setSiteId(value)
    updateFilters({ search, status, siteId: value })
  }

  const clearFilters = () => {
    setSearch("")
    setStatus("")
    setSiteId("")
    router.push("/admin/authors")
  }

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current)
    }
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search authors by name..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Site Filter */}
        <div>
          <select
            value={siteId}
            onChange={(e) => handleSiteChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Sites</option>
            <option value="induslens">IndusLens</option>
            <option value="industales">IndusTales</option>
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