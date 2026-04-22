"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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

export type PlaylistType = 'hero' | 'other-stories' | 'industales'

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
    author?: {
      id: string
      name: string
    } | null
    images: Array<{
      imageUrl: string[]
    }>
  }
}

interface PlaylistManagerProps {
  type: PlaylistType
}

export default function PlaylistManager({ type }: PlaylistManagerProps) {
  const router = useRouter()
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
  }>({
    isOpen: false,
    itemId: null,
    articleTitle: ""
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load playlist items
  const loadPlaylist = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/playlists/${type}`)

      if (!response.ok) {
        throw new Error('Failed to load playlist')
      }

      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error loading playlist:', error)
      setError(error instanceof Error ? error.message : 'Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }, [type])

  // Load playlist on mount and type change
  useEffect(() => {
    loadPlaylist()
    setHasUnsavedChanges(false)
  }, [loadPlaylist])

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        setHasUnsavedChanges(true)
        return newItems
      })
    }
  }

  // Save order changes
  const handleSaveOrder = async () => {
    setSaving(true)
    setError("")

    try {
      const reorderData = items.map((item, index) => ({
        id: item.id,
        order: index + 1
      }))

      const response = await fetch(`/api/playlists/${type}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: reorderData }),
      })

      if (!response.ok) {
        throw new Error('Failed to save order')
      }

      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving order:', error)
      setError(error instanceof Error ? error.message : 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  // Handle remove article
  const handleRemoveClick = (itemId: string, articleTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      itemId,
      articleTitle
    })
  }

  const handleRemoveConfirm = async () => {
    if (!deleteDialog.itemId) return

    try {
      const response = await fetch(`/api/playlists/${type}/${deleteDialog.itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove article')
      }

      // Remove item from local state
      setItems(items => items.filter(item => item.id !== deleteDialog.itemId))
      setDeleteDialog({ isOpen: false, itemId: null, articleTitle: "" })

      // Refresh playlist to get updated order
      await loadPlaylist()

    } catch (error) {
      console.error('Error removing article:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove article')
    }
  }

  // Handle article added from modal
  const handleArticleAdded = () => {
    setShowAddModal(false)
    loadPlaylist() // Refresh the list
  }

  const getPlaylistTitle = () => {
    if (type === 'hero') return 'Hero Playlist'
    if (type === 'industales') return 'IndusTales Playlist'
    return 'Other Stories Playlist'
  }

  const getEmptyMessage = () => {
    if (type === 'hero') return 'No articles in hero playlist. Add some featured articles to get started.'
    if (type === 'industales') return 'No articles in IndusTales playlist. Add some stories to get started.'
    return 'No articles in other stories playlist. Add some articles to build your collection.'
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading playlist...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{getPlaylistTitle()}</h2>
          <p className="text-sm text-gray-600">
            {items.length} article{items.length !== 1 ? 's' : ''} • Drag to reorder
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Order'
              )}
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Article
          </button>
        </div>
      </div>

      {/* Playlist Items */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
          <p className="mt-1 text-sm text-gray-500">{getEmptyMessage()}</p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add First Article
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <PlaylistItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={(itemId, articleTitle) => handleRemoveClick(itemId, articleTitle)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Article Modal */}
      {showAddModal && (
        <AddArticleModal
          type={type}
          onClose={() => setShowAddModal(false)}
          onArticleAdded={handleArticleAdded}
        />
      )}

      {/* Delete Confirmation */}
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