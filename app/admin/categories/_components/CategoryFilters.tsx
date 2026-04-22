"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useRef, useState } from "react"
import { Search, X } from "lucide-react"

const typeOptions = [
  { value: "",      label: "All" },
  { value: "true",  label: "News" },
  { value: "false", label: "Content" },
]

export default function CategoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isNews, setIsNews] = useState(searchParams.get("isNews") || "")
  const searchTimer = useRef<NodeJS.Timeout | null>(null)

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    params.delete("page")
    router.push(`/admin/categories?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => updateParam("search", value), 400)
  }

  const hasFilters = searchParams.get("search") || searchParams.get("isNews")

  return (
    <div className="flex items-center gap-3 flex-none flex-wrap">
      <div className="relative flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories…"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder-gray-400 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setIsNews(opt.value); updateParam("isNews", opt.value) }}
            className={
              isNews === opt.value
                ? "rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white"
                : "rounded-md px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={() => { setIsNews(""); router.push("/admin/categories") }}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 shadow-sm hover:text-gray-800 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
