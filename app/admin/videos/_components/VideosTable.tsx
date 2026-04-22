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
import { Pencil, Trash2 } from "lucide-react"
import ConfirmDialog from "../../_components/ConfirmDialog"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

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

const statusStyle: Record<string, string> = {
  Published: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  Draft:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  Archived:  "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
}

function getThumbnail(images: VideoImage[]): string | null {
  // Trending videos use featuredImage, IndusTv videos use detailsPageBackground
  const thumb =
    images.find((img) => img.imageCategoryValue === "featuredImage") ||
    images.find((img) => img.imageCategoryValue === "detailsPageBackground") ||
    images[0]
  const raw = thumb?.imageUrl?.[0]
  if (!raw) return null
  const url = resolveStoredImageToUrl(
    raw,
    "videos",
    thumb?.imageCategoryValue ?? "featuredImage"
  )
  return url || null
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
      className={`group transition-colors ${isDragging ? "bg-gray-50 shadow-sm z-10" : "hover:bg-gray-50/60"}`}
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
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[video.status] ?? statusStyle.Archived}`}>
          {video.status}
        </span>
      </td>

      {/* Updated */}
      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
        {formatDistanceToNow(new Date(video.updatedAt), { addSuffix: true })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/admin/videos/${video.id}/edit`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onDeleteClick(video.id, video.name)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <span className="font-medium text-amber-800">Unsaved changes to video order</span>
          <div className="flex items-center gap-2">
            <button onClick={handleResetOrder} disabled={isSaving} className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">Reset</button>
            <button onClick={handleSaveOrder} disabled={isSaving} className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localVideos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 w-20">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Video</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">YouTube ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Updated</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localVideos.map((video) => (
                <SortableVideoRow key={video.id} video={video} onDeleteClick={handleDeleteClick} />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

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
