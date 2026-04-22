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

  function handleResetOrder() {
    loadSpecials()
    setHasUnsavedChanges(false)
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
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    )
  }

  const inputCls = "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"

  return (
    <div className="flex flex-col gap-5">
      {/* Page settings */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Page Settings</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Page Title</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="IndusLens Specials"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Page Description</label>
            <input
              type="text"
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
              placeholder="Short description shown on the specials page"
              className={inputCls}
            />
          </div>
        </div>
        <button
          onClick={handleSavePage}
          disabled={savingPage}
          className="mt-3 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {savingPage ? "Saving…" : "Save Page Settings"}
        </button>
      </div>

      {/* Specials list card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">{error}</div>
        )}

        {hasUnsavedChanges && (
          <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
            <span className="font-medium text-amber-800">Unsaved changes to specials order</span>
            <div className="flex items-center gap-2">
              <button onClick={handleResetOrder} disabled={saving} className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">Reset</button>
              <button onClick={handleSaveOrder} disabled={saving} className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
                {saving ? "Saving…" : "Save Order"}
              </button>
            </div>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            {items.length} section{items.length !== 1 ? "s" : ""} · Drag to reorder
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            Add Special
          </button>
        </div>

        {/* List */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-900">No specials yet</p>
            <p className="mt-1 text-sm text-gray-500">Add a category to create a special section.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              Add First Special
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="p-3 space-y-1.5">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <SpecialItem
                      item={item}
                      index={index}
                      onRemove={handleRemoveClick}
                      onEdit={handleEditClick}
                    />

                    {editingId === item.id && (
                      <div className="mt-1 mb-1 border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={editState.title}
                              onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
                              placeholder="e.g. India Leads Global South"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={editState.description}
                              onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                              placeholder="Short description shown below the title"
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <div className="max-w-xs">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Category to Display</label>
                          <select
                            value={editState.categoryId}
                            onChange={(e) => setEditState((s) => ({ ...s, categoryId: e.target.value }))}
                            className={inputCls}
                          >
                            <option value="">— Select a category —</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleEditSave(item.id)}
                            disabled={editState.saving}
                            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                          >
                            {editState.saving ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
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
      </div>

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
