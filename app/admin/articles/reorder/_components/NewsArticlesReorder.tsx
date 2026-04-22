"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import NewsArticleRow from "./NewsArticleRow"

interface Category {
  id: string
  name: string
  slug: string
}

interface Article {
  id: string
  headline: string
  excerpt?: string | null
  status: string
  categoryOrder: number | null
  updatedAt: Date
}

interface Props {
  categories: Category[]
}

export default function NewsArticlesReorder({ categories }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id ?? ""
  )
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [error, setError] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadArticles = useCallback(async (categoryId: string) => {
    if (!categoryId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/articles?categoryId=${categoryId}&limit=200&orderBy=categoryOrder`
      )
      if (!res.ok) throw new Error("Failed to load articles")
      const data = await res.json()
      const sorted = (data.articles as Article[]).slice().sort(
        (a, b) => (a.categoryOrder ?? 0) - (b.categoryOrder ?? 0)
      )
      setArticles(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setHasUnsavedChanges(false)
    loadArticles(selectedCategoryId)
  }, [selectedCategoryId, loadArticles])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active.id !== over?.id) {
      setArticles((prev) => {
        const oldIndex = prev.findIndex((a) => a.id === active.id)
        const newIndex = prev.findIndex((a) => a.id === over?.id)
        setHasUnsavedChanges(true)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    setError("")
    try {
      await Promise.all(
        articles.map((a, i) =>
          fetch(`/api/articles/${a.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryOrder: i + 1 }),
          })
        )
      )
      setHasUnsavedChanges(false)
      await loadArticles(selectedCategoryId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order")
    } finally {
      setSaving(false)
    }
  }

  const handleResetOrder = () => {
    setHasUnsavedChanges(false)
    loadArticles(selectedCategoryId)
  }

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === selectedCategoryId) return
    setSelectedCategoryId(categoryId)
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">No news categories found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700 flex-none">
          {error}
        </div>
      )}

      {/* Unsaved changes amber banner */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm flex-none">
          <span className="font-medium text-amber-800">Unsaved changes to article order</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetOrder}
              disabled={saving}
              className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      {/* Category tabs header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-100 flex-none flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={
                selectedCategoryId === cat.id
                  ? "rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white"
                  : "rounded-md px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          {loading ? "Loading…" : `${articles.length} article${articles.length !== 1 ? "s" : ""} · drag to reorder`}
        </p>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="flex items-center justify-center py-16 flex-none">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex items-center justify-center py-16 flex-none">
          <p className="text-sm text-gray-500">No articles in this category.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={articles.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 w-20">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                      Article
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                      Modified
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {articles.map((article, index) => (
                    <NewsArticleRow key={article.id} article={article} index={index} />
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
