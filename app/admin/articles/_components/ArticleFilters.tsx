"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusOptions = [
  { value: "",          label: "All" },
  { value: "DRAFT",     label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED",  label: "Archived" },
]

const siteOptions = [
  { value: "",           label: "All Sites" },
  { value: "induslens",  label: "IndusLens" },
  { value: "industales", label: "IndusTales" },
]

interface DropdownOption { id: string; name: string }

export default function ArticleFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status,     setStatus]     = useState(searchParams.get("status")     || "")
  const [siteId,     setSiteId]     = useState(searchParams.get("siteId")     || "")
  const [authorId,   setAuthorId]   = useState(searchParams.get("authorId")   || "")
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "")
  const [search,     setSearch]     = useState(searchParams.get("search")     || "")

  const [authors,    setAuthors]    = useState<DropdownOption[]>([])
  const [categories, setCategories] = useState<DropdownOption[]>([])
  const [authorSearch, setAuthorSearch] = useState("")

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/authors/dropdown").then(r => r.json()).catch(() => []),
      fetch("/api/categories/dropdown").then(r => r.json()).catch(() => []),
    ]).then(([a, c]) => {
      setAuthors(a)
      setCategories(c)
    })
  }, [])

  const push = (next: {
    status: string; siteId: string; authorId: string; categoryId: string; search: string
  }) => {
    const params = new URLSearchParams(searchParams)
    next.status     ? params.set("status",     next.status)     : params.delete("status")
    next.siteId     ? params.set("siteId",     next.siteId)     : params.delete("siteId")
    next.authorId   ? params.set("authorId",   next.authorId)   : params.delete("authorId")
    next.categoryId ? params.set("categoryId", next.categoryId) : params.delete("categoryId")
    next.search     ? params.set("search",     next.search)     : params.delete("search")
    params.delete("page")
    router.push(`/admin/articles?${params.toString()}`)
  }

  const cur = () => ({ status, siteId, authorId, categoryId, search })

  const handleSearch    = (val: string) => {
    setSearch(val)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => push({ ...cur(), search: val }), 400)
  }
  const handleStatus    = (val: string) => { setStatus(val);     push({ ...cur(), status: val }) }
  const handleSite      = (val: string) => { setSiteId(val);     push({ ...cur(), siteId: val }) }
  const handleAuthor    = (val: string) => { setAuthorId(val);   push({ ...cur(), authorId: val }) }
  const handleCategory  = (val: string) => { setCategoryId(val); push({ ...cur(), categoryId: val }) }

  const hasFilters = status || siteId || authorId || categoryId || search

  useEffect(() => () => { if (searchDebounce.current) clearTimeout(searchDebounce.current) }, [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-56">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search articles…"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-colors"
        />
      </div>

      {/* Author */}
      <Select value={authorId} onValueChange={(val) => { setAuthorSearch(""); handleAuthor(val) }}>
        <SelectTrigger className="h-9 w-44 rounded-lg border border-gray-200 bg-white text-sm shadow-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200">
          <SelectValue placeholder="All Authors" />
        </SelectTrigger>
        <SelectContent>
          <div className="sticky top-0 bg-white px-1 pb-1 pt-1 z-10">
            <input
              type="text"
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search authors…"
              className="h-8 w-full rounded-md border border-gray-200 px-2.5 text-sm placeholder-gray-400 outline-none focus:border-gray-400"
            />
          </div>
          <SelectItem value="">All Authors</SelectItem>
          {authors
            .filter((a) => a.name.toLowerCase().includes(authorSearch.toLowerCase()))
            .map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Category */}
      <Select value={categoryId} onValueChange={handleCategory}>
        <SelectTrigger className="h-9 w-44 rounded-lg border border-gray-200 bg-white text-sm shadow-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Site tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {siteOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSite(opt.value)}
            className={
              siteId === opt.value
                ? "rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white"
                : "rounded-md px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            }
          >
            {opt.label}
          </button>
        ))}
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
          onClick={() => {
            setSearch(""); setStatus(""); setSiteId("")
            setAuthorId(""); setCategoryId("")
            router.push("/admin/articles")
          }}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 shadow-sm hover:text-gray-800 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
