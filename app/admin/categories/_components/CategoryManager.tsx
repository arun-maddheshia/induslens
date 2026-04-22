"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import Link from "next/link"
import CategoryItem from "./CategoryItem"
import CategoryArticlesModal from "./CategoryArticlesModal"
import ConfirmDialog from "../../_components/ConfirmDialog"

interface Category {
  id: string
  slug: string
  name: string
  description: string
  isNews: boolean
  siteId: string
  order: number
  createdAt: Date
  updatedAt: Date
  _count: { articles: number }
}

export default function CategoryManager() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showArticlesModal, setShowArticlesModal] = useState<{ categoryId: string; categoryName: string } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    categoryId: string | null
    categoryName: string
  }>({ isOpen: false, categoryId: null, categoryName: "" })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const search = searchParams.get("search")?.toLowerCase() ?? ""
  const isNewsFilter = searchParams.get("isNews")
  const siteFilter = searchParams.get("siteId") ?? ""
  const isFiltered = !!search || (isNewsFilter !== null && isNewsFilter !== "")

  const visibleCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (search && !cat.name.toLowerCase().includes(search) && !cat.slug.toLowerCase().includes(search)) return false
      if (isNewsFilter === "true" && !cat.isNews) return false
      if (isNewsFilter === "false" && cat.isNews) return false
      if (siteFilter && cat.siteId !== siteFilter) return false
      return true
    })
  }, [categories, search, isNewsFilter, siteFilter])

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/categories?limit=100")
      if (!response.ok) throw new Error("Failed to load categories")
      const data = await response.json()
      const sorted = (data.categories || []).sort((a: Category, b: Category) => a.order - b.order)
      setCategories(sorted)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
    setHasUnsavedChanges(false)
  }, [loadCategories])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active.id !== over?.id) {
      setCategories((categories) => {
        const oldIndex = categories.findIndex((cat) => cat.id === active.id)
        const newIndex = categories.findIndex((cat) => cat.id === over?.id)
        setHasUnsavedChanges(true)
        return arrayMove(categories, oldIndex, newIndex)
      })
    }
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    setError("")
    try {
      await Promise.all(
        categories.map((category, index) =>
          fetch(`/api/categories/${category.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index + 1 }),
          })
        )
      )
      setHasUnsavedChanges(false)
      await loadCategories()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save order")
    } finally {
      setSaving(false)
    }
  }

  const handleResetOrder = () => {
    loadCategories()
    setHasUnsavedChanges(false)
  }

  const handleEditCategory = (categoryId: string) => {
    router.push(`/admin/categories/${categoryId}/edit`)
  }

  const handleManageArticles = (categoryId: string, categoryName: string) => {
    setShowArticlesModal({ categoryId, categoryName })
  }

  const handleDeleteClick = (category: Category) => {
    setDeleteDialog({ isOpen: true, categoryId: category.id, categoryName: category.name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoryId) return
    try {
      const response = await fetch(`/api/categories/${deleteDialog.categoryId}`, { method: "DELETE" })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete category")
      }
      setCategories((categories) => categories.filter((cat) => cat.id !== deleteDialog.categoryId))
      setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700 flex-none">{error}</div>
      )}

      {hasUnsavedChanges && (
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm flex-none">
          <span className="font-medium text-amber-800">Unsaved changes to category order</span>
          <div className="flex items-center gap-2">
            <button onClick={handleResetOrder} disabled={saving} className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">Reset</button>
            <button onClick={handleSaveOrder} disabled={saving} className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      {/* Stats + action */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-none">
        <p className="text-xs text-gray-500">
          {isFiltered ? `${visibleCategories.length} of ${categories.length}` : categories.length} categories
          {!isFiltered && " · drag to reorder"}
        </p>
        <Link
          href="/admin/categories/new"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Add Category
        </Link>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="text-center py-12 flex-none">
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-900">No categories yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your first category to organize articles.</p>
          <Link
            href="/admin/categories/new"
            className="mt-4 inline-block rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            Add First Category
          </Link>
        </div>
      ) : visibleCategories.length === 0 ? (
        <div className="text-center py-10 flex-none">
          <p className="text-sm text-gray-500">No categories match your filters.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={isFiltered ? undefined : handleDragEnd}>
            <SortableContext items={visibleCategories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-gray-100">
                    {!isFiltered && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 w-20">Order</th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Articles</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Updated</th>
                    <th className="px-4 py-3 w-36" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleCategories.map((category, index) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      index={index}
                      showDragHandle={!isFiltered}
                      onEdit={handleEditCategory}
                      onManageArticles={handleManageArticles}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {showArticlesModal && (
        <CategoryArticlesModal
          categoryId={showArticlesModal.categoryId}
          categoryName={showArticlesModal.categoryName}
          onClose={() => setShowArticlesModal(null)}
          onArticlesUpdated={loadCategories}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" })}
        type="danger"
      />
    </div>
  )
}
