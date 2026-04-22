"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  articleCount: number
}

interface Props {
  excludeIds: string[]
  onClose: () => void
  onAdded: () => void
}

export default function AddCategoryModal({ excludeIds, onClose, onAdded }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/public-categories")
      .then((r) => r.json())
      .then((data) => {
        const all: Category[] = (data.data ?? []).filter(
          (c: Category) => !excludeIds.includes(c.id)
        )
        setCategories(all)
      })
      .catch(() => setError("Failed to load categories"))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(category: Category) {
    setAdding(category.id)
    setError("")
    try {
      const res = await fetch("/api/specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: category.name, categoryId: category.id }),
      })
      if (!res.ok) throw new Error("Failed to add")
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add")
    } finally {
      setAdding(null)
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Add Special</h3>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 mb-3"
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 mb-3 text-sm text-red-700">{error}</div>
            )}

            <div className="max-h-80 overflow-y-auto space-y-1.5">
              {loading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {search ? `No categories match "${search}"` : "All categories already added"}
                </div>
              ) : (
                filtered.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between px-3 py-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">
                        {category.articleCount} article{category.articleCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(category)}
                      disabled={adding === category.id}
                      className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {adding === category.id ? "Adding…" : "Add"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
