"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Search, X } from "lucide-react"

const statusOptions = [
  { value: "",          label: "All" },
  { value: "Published", label: "Published" },
  { value: "Draft",     label: "Draft" },
  { value: "Archived",  label: "Archived" },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(h)
  }, [value, delay])
  return debounced
}

export default function EminenceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch]   = useState(searchParams.get("search")  || "")
  const [status, setStatus]   = useState(searchParams.get("status")  || "")
  const [country, setCountry] = useState(searchParams.get("country") || "")

  const dSearch  = useDebounce(search,  350)
  const dCountry = useDebounce(country, 350)

  const sync = useCallback((s: string, st: string, c: string) => {
    const p = new URLSearchParams()
    if (s)  p.set("search",  s)
    if (st) p.set("status",  st)
    if (c)  p.set("country", c)
    p.set("page", "1")
    router.push(`/admin/eminence?${p.toString()}`)
  }, [router])

  useEffect(() => { sync(dSearch, status, dCountry) }, [dSearch, status, dCountry, sync])

  const hasFilters = search || status || country

  return (
    <div className="flex items-center gap-3 flex-none flex-wrap">
      <div className="relative flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder-gray-400 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
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

      <div className="relative">
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country…"
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors w-32"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setStatus(""); setCountry("") }}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 shadow-sm hover:text-gray-800 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
