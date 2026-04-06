"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useRef } from "react"

const VIDEO_STATUSES = [
  { value: "", label: "All" },
  { value: "Published", label: "Published" },
  { value: "Draft", label: "Draft" },
  { value: "Archived", label: "Archived" },
]

export default function VideoFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`/admin/videos?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => updateParam("search", value), 400)
  }

  const handleClear = () => {
    router.push("/admin/videos")
  }

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("status") ||
    searchParams.get("category")

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, synopsis..."
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            defaultValue={searchParams.get("status") ?? ""}
            onChange={(e) => updateParam("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {VIDEO_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="filterIndusTv"
            defaultChecked={searchParams.get("category") === "industv"}
            onChange={(e) => updateParam("category", e.target.checked ? "industv" : "")}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="filterIndusTv" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            IndusTv only
          </label>
        </div>

        {hasFilters && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
