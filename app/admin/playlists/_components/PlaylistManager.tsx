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
import PlaylistItem from "./PlaylistItem"
import AddArticleModal from "./AddArticleModal"
import ConfirmDialog from "../../_components/ConfirmDialog"

export type PlaylistType = "hero" | "other-stories" | "industales" | "industales-other-stories"

interface PlaylistItemData {
  id: string
  order: number
  articleId: string
  article: {
    id: string
    headline: string
    excerpt: string
    status: string
    publishedAt: Date | null
    author?: { id: string; name: string } | null
    images: Array<{ imageUrl: string[] }>
  }
}

export default function PlaylistManager({ type }: { type: PlaylistType }) {
  const [items, setItems] = useState<PlaylistItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    itemId: string | null
    articleTitle: string
  }>({ isOpen: false, itemId: null, articleTitle: "" })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadPlaylist = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/playlists/${type}`)
      if (!response.ok) throw new Error("Failed to load playlist")
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load playlist")
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    loadPlaylist()
    setHasUnsavedChanges(false)
  }, [loadPlaylist])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        setHasUnsavedChanges(true)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/playlists/${type}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item, index) => ({ id: item.id, order: index + 1 })) }),
      })
      if (!response.ok) throw new Error("Failed to save order")
      setHasUnsavedChanges(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save order")
    } finally {
      setSaving(false)
    }
  }

  const handleResetOrder = () => {
    loadPlaylist()
    setHasUnsavedChanges(false)
  }

  const handleRemoveClick = (itemId: string, articleTitle: string) => {
    setDeleteDialog({ isOpen: true, itemId, articleTitle })
  }

  const handleRemoveConfirm = async () => {
    if (!deleteDialog.itemId) return
    try {
      const response = await fetch(`/api/playlists/${type}/${deleteDialog.itemId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to remove article")
      setItems((items) => items.filter((item) => item.id !== deleteDialog.itemId))
      setDeleteDialog({ isOpen: false, itemId: null, articleTitle: "" })
      await loadPlaylist()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to remove article")
    }
  }

  const playlistLabel =
    type === "hero" ? "Hero Playlist" :
    type === "industales" ? "IndusTales Featured Playlist" :
    type === "industales-other-stories" ? "IndusTales Other Stories Playlist" :
    "Other Stories Playlist"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">{error}</div>
      )}

      {hasUnsavedChanges && (
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <span className="font-medium text-amber-800">Unsaved changes to playlist order</span>
          <div className="flex items-center gap-2">
            <button onClick={handleResetOrder} disabled={saving} className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">Reset</button>
            <button onClick={handleSaveOrder} disabled={saving} className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-500">
          {items.length} article{items.length !== 1 ? "s" : ""} · Drag to reorder
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Add Article
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-900">No articles in {playlistLabel}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            Add First Article
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="p-3 space-y-1.5">
              {items.map((item, index) => (
                <PlaylistItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={handleRemoveClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showAddModal && (
        <AddArticleModal
          type={type}
          onClose={() => setShowAddModal(false)}
          onArticleAdded={() => { setShowAddModal(false); loadPlaylist() }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, itemId: null, articleTitle: "" })}
        onConfirm={handleRemoveConfirm}
        title="Remove from Playlist"
        message={`Are you sure you want to remove "${deleteDialog.articleTitle}" from this playlist?`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
