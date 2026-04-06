"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
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
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import ConfirmDialog from "../../_components/ConfirmDialog"

interface VideoImage {
  id: string
  imageCategory: string
  imageCategoryValue?: string | null
  imageUrl: string[]
}

interface Video {
  id: string
  name: string
  slug: string
  contentId: string
  category?: string | null
  status: string
  order: number
  author?: string | null
  updatedAt: Date
  images: VideoImage[]
}

interface VideosTableProps {
  videos: Video[]
}

const statusColors: Record<string, string> = {
  Published: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Archived: "bg-red-100 text-red-800",
}

function getThumbnail(images: VideoImage[]): string | null {
  // Trending videos use featuredImage, IndusTv videos use detailsPageBackground
  const thumb =
    images.find((img) => img.imageCategoryValue === "featuredImage") ||
    images.find((img) => img.imageCategoryValue === "detailsPageBackground") ||
    images[0]
  return thumb?.imageUrl?.[0] ?? null
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableVideoRow({
  video,
  onDeleteClick,
}: {
  video: Video
  onDeleteClick: (id: string, name: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const thumbnail = getThumbnail(video.images)

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? "bg-gray-100 shadow-lg z-10" : ""}`}
    >
      {/* Drag handle + order */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zM7 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zM7 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zM13 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2zM13 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zM13 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
            </svg>
          </button>
          <span className="text-sm text-gray-400 w-5 text-right">{video.order}</span>
        </div>
      </td>

      {/* Thumbnail + name */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-20 h-12 relative rounded overflow-hidden bg-gray-100">
            {thumbnail ? (
              <Image src={thumbnail} alt={video.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[260px]">{video.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[260px]">{video.slug}</p>
            {video.author && <p className="text-xs text-gray-400">{video.author}</p>}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-4">
        {video.category === "industv" ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
            IndusTv
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* YouTube ID */}
      <td className="px-4 py-4">
        <p className="text-xs text-gray-400 font-mono">{video.contentId}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[video.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {video.status}
        </span>
      </td>

      {/* Updated */}
      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
        {formatDistanceToNow(new Date(video.updatedAt), { addSuffix: true })}
      </td>

      {/* Actions */}
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={video.category === "industv" ? `/industv/${video.slug}` : `/videos/${video.slug}`}
            target="_blank"
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            title="View on site"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <Link
            href={`/admin/videos/${video.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={() => onDeleteClick(video.id, video.name)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────

export default function VideosTable({ videos }: VideosTableProps) {
  const router = useRouter()
  const [localVideos, setLocalVideos] = useState<Video[]>(videos)
  const [originalVideos, setOriginalVideos] = useState<Video[]>(videos)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    videoId: string
    videoName: string
  }>({ isOpen: false, videoId: "", videoName: "" })
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    setLocalVideos(videos)
    setOriginalVideos(videos)
    setHasUnsavedChanges(false)
  }, [videos])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localVideos.findIndex((v) => v.id === active.id)
    const newIndex = localVideos.findIndex((v) => v.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(localVideos, oldIndex, newIndex).map((v, i) => ({
      ...v,
      order: i + 1,
    }))

    setLocalVideos(reordered)
    setHasUnsavedChanges(true)
  }

  const handleSaveOrder = async () => {
    setIsSaving(true)
    try {
      const updates = localVideos.map((v, i) => ({ id: v.id, order: i + 1 }))
      const res = await fetch("/api/videos/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(`Failed to save order: ${data.error}`)
        return
      }

      setOriginalVideos([...localVideos])
      setHasUnsavedChanges(false)
      router.refresh()
    } catch {
      alert("An error occurred while saving the video order.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetOrder = () => {
    setLocalVideos([...originalVideos])
    setHasUnsavedChanges(false)
  }

  const handleDeleteClick = (videoId: string, videoName: string) => {
    setConfirmDialog({ isOpen: true, videoId, videoName })
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/videos/${confirmDialog.videoId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to delete video")
        return
      }
      setConfirmDialog({ isOpen: false, videoId: "", videoName: "" })
      router.refresh()
    } catch {
      alert("Failed to delete video")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, videoId: "", videoName: "" })
  }

  if (localVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0121 8.68v6.64a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new video.</p>
        <div className="mt-6">
          <Link href="/admin/videos/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            New Video
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Unsaved order banner */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-amber-800">
                You have unsaved changes to the video order
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetOrder}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-md hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="px-4 py-1.5 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localVideos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    YouTube ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localVideos.map((video) => (
                  <SortableVideoRow
                    key={video.id}
                    video={video}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Video"
        message={`Are you sure you want to delete "${confirmDialog.videoName}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  )
}
