"use client"

import { useState, useEffect } from "react"

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
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Add Special</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Loading categories…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {search ? `No categories match "${search}"` : "All categories already added"}
                </div>
              ) : (
                filtered.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {category.articleCount} article{category.articleCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(category)}
                      disabled={adding === category.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adding === category.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Adding…
                        </>
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
