"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

const statusOptions = [
  { value: "",          label: "All" },
  { value: "Published", label: "Published" },
  { value: "Draft",     label: "Draft" },
  { value: "Archived",  label: "Archived" },
]

const siteOptions = [
  { value: "",           label: "All Sites" },
  { value: "induslens",  label: "IndusLens" },
  { value: "industales", label: "IndusTales" },
]

export default function AuthorFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [siteId, setSiteId] = useState(searchParams.get("siteId") || "")
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const push = (next: { search: string; status: string; siteId: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    next.search  ? params.set("search",  next.search)  : params.delete("search")
    next.status  ? params.set("status",  next.status)  : params.delete("status")
    next.siteId  ? params.set("siteId",  next.siteId)  : params.delete("siteId")
    params.delete("page")
    router.push(`/admin/authors?${params.toString()}`)
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => push({ search: val, status, siteId }), 400)
  }

  const hasFilters = search || status || siteId

  useEffect(() => () => { if (searchDebounce.current) clearTimeout(searchDebounce.current) }, [])

  return (
    <div className="flex items-center gap-3 flex-none flex-wrap">
      <div className="relative flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search authors…"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
        />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatus(opt.value); push({ search, status: opt.value, siteId }) }}
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

      {/* Site select */}
      <select
        value={siteId}
        onChange={(e) => { setSiteId(e.target.value); push({ search, status, siteId: e.target.value }) }}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
      >
        {siteOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setStatus(""); setSiteId(""); router.push("/admin/authors") }}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 shadow-sm hover:text-gray-800 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
