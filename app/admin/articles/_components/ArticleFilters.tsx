"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

const statusOptions = [
  { value: "",          label: "All" },
  { value: "DRAFT",     label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED",  label: "Archived" },
]

export default function ArticleFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const push = (next: { status: string; search: string }) => {
    const params = new URLSearchParams(searchParams)
    next.status ? params.set("status", next.status) : params.delete("status")
    next.search ? params.set("search", next.search) : params.delete("search")
    params.delete("page")
    router.push(`/admin/articles?${params.toString()}`)
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => push({ status, search: val }), 400)
  }

  const handleStatus = (val: string) => {
    setStatus(val)
    push({ status: val, search })
  }

  const hasFilters = status || search

  useEffect(() => () => { if (searchDebounce.current) clearTimeout(searchDebounce.current) }, [])

  return (
    <div className="flex items-center gap-3 flex-none">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search articles…"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
        />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleStatus(opt.value)}
            className={
              status === opt.value
                ? "rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white"
                : "rounded-md px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setStatus(""); router.push("/admin/articles") }}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 shadow-sm hover:text-gray-800 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
