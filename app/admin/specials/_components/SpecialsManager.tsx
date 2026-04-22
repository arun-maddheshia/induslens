"use client"

import { useState, useCallback, useEffect } from "react"
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
import SpecialItem from "./SpecialItem"
import AddCategoryModal from "./AddCategoryModal"
import ConfirmDialog from "../../_components/ConfirmDialog"

interface Category {
  id: string
  name: string
  slug: string
}

interface SpecialItemData {
  id: string
  order: number
  title: string
  description: string
  categoryId: string | null
  categoryRef: { id: string; name: string; slug: string } | null
  articleCount: number
}

interface EditState {
  title: string
  description: string
  categoryId: string
  saving: boolean
}

export default function SpecialsManager() {
  const [items, setItems] = useState<SpecialItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ title: "", description: "", categoryId: "", saving: false })
  const [categories, setCategories] = useState<Category[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    itemId: string | null
    name: string
  }>({ isOpen: false, itemId: null, name: "" })

  const [pageTitle, setPageTitle] = useState("")
  const [pageDescription, setPageDescription] = useState("")
  const [savingPage, setSavingPage] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadSpecials = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/specials")
      if (!res.ok) throw new Error("Failed to load specials")
      const data: any[] = await res.json()

      const withCounts = await Promise.all(
        data.map(async (s) => {
          if (!s.categoryId) return { ...s, articleCount: 0 }
          const r = await fetch(
            `/api/specials/category-preview?categoryId=${encodeURIComponent(s.categoryId)}`
          )
          const { count } = await r.json()
          return { ...s, articleCount: count ?? 0 }
        })
      )
      setItems(withCounts)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load specials")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSpecials()
    setHasUnsavedChanges(false)
  }, [loadSpecials])

  useEffect(() => {
    fetch("/api/public-categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data ?? []))
      .catch(() => {})
    fetch("/api/specials/page-settings")
      .then((r) => r.json())
      .then((d) => { setPageTitle(d.title ?? ""); setPageDescription(d.description ?? "") })
      .catch(() => {})
  }, [])

  async function handleSavePage() {
    setSavingPage(true)
    await fetch("/api/specials/page-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: pageTitle, description: pageDescription }),
    })
    setSavingPage(false)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id)
      const newIndex = prev.findIndex((i) => i.id === over.id)
      setHasUnsavedChanges(true)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  async function handleSaveOrder() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/specials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: items.map((item, index) => ({ id: item.id, order: index + 1 })),
        }),
      })
      if (!res.ok) throw new Error("Failed to save order")
      setHasUnsavedChanges(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save order")
    } finally {
      setSaving(false)
    }
  }

  function handleEditClick(id: string) {
    if (editingId === id) {
      setEditingId(null)
      return
    }
    const item = items.find((i) => i.id === id)
    if (!item) return
    setEditingId(id)
    setEditState({
      title: item.title,
      description: item.description,
      categoryId: item.categoryId ?? "",
      saving: false,
    })
  }

  async function handleEditSave(id: string) {
    setEditState((s) => ({ ...s, saving: true }))
    try {
      const selectedCategory = categories.find((c) => c.id === editState.categoryId)
      const res = await fetch(`/api/specials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editState.title || selectedCategory?.name || "",
          description: editState.description,
          categoryId: editState.categoryId || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const updated = await res.json()
      // Refresh article count if category changed
      let articleCount = items.find((i) => i.id === id)?.articleCount ?? 0
      if (updated.categoryId) {
        const r = await fetch(
          `/api/specials/category-preview?categoryId=${encodeURIComponent(updated.categoryId)}`
        )
        const { count } = await r.json()
        articleCount = count ?? 0
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...updated, articleCount } : i))
      )
      setEditingId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setEditState((s) => ({ ...s, saving: false }))
    }
  }

  function handleRemoveClick(itemId: string, name: string) {
    setDeleteDialog({ isOpen: true, itemId, name })
  }

  async function handleRemoveConfirm() {
    if (!deleteDialog.itemId) return
    try {
      await fetch(`/api/specials/${deleteDialog.itemId}`, { method: "DELETE" })
      setItems((prev) => prev.filter((i) => i.id !== deleteDialog.itemId))
      if (editingId === deleteDialog.itemId) setEditingId(null)
      setDeleteDialog({ isOpen: false, itemId: null, name: "" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading specials…</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page settings */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Page Settings</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="IndusLens Specials"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Description</label>
            <input
              type="text"
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
              placeholder="Short description shown on the specials page"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleSavePage}
          disabled={savingPage}
          className="mt-3 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {savingPage ? "Saving…" : "Save Page Settings"}
        </button>
      </div>

      <hr className="border-gray-200" />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Specials</h2>
          <p className="text-sm text-gray-600">
            {items.length} section{items.length !== 1 ? "s" : ""} · Drag to reorder
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving…
                </>
              ) : (
                "Save Order"
              )}
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Special
          </button>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No specials yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add a category to create a special section.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add First Special
            </button>
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id}>
                  <SpecialItem
                    item={item}
                    index={index}
                    onRemove={handleRemoveClick}
                    onEdit={handleEditClick}
                  />

                  {/* Inline edit panel */}
                  {editingId === item.id && (
                    <div className="mt-1 mb-1 border border-indigo-200 rounded-lg bg-indigo-50 p-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={editState.title}
                            onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
                            placeholder="e.g. India Leads Global South"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={editState.description}
                            onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                            placeholder="Short description shown below the title"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="max-w-xs">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category to Display</label>
                        <select
                          value={editState.categoryId}
                          onChange={(e) => setEditState((s) => ({ ...s, categoryId: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">— Select a category —</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleEditSave(item.id)}
                          disabled={editState.saving}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {editState.saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showAddModal && (
        <AddCategoryModal
          excludeIds={items.map((i) => i.categoryId).filter(Boolean) as string[]}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false)
            loadSpecials()
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, itemId: null, name: "" })}
        onConfirm={handleRemoveConfirm}
        title="Remove Special"
        message={`Are you sure you want to remove "${deleteDialog.name}" from Specials?`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
