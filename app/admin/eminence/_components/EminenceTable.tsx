"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
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
import { resolveStoredImageToUrl } from "@/lib/image-storage"

interface EminenceImage {
  id: string
  imageCategory: string
  imageCategoryValue?: string | null
  imageUrl: string[]
}

interface EminenceEntry {
  id: string
  name: string
  slug: string
  countryName?: string | null
  status: string
  order: number
  updatedAt: Date
  images: EminenceImage[]
}

interface EminenceTableProps {
  entries: EminenceEntry[]
}

const statusStyle: Record<string, string> = {
  Published: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  Draft:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  Archived:  "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
}

function getPhoto(images: EminenceImage[]): string | null {
  const img =
    images.find((i) => i.imageCategoryValue === "mobileDetailsPageBackground") ||
    images[0]
  const raw = img?.imageUrl?.[0]
  if (!raw) return null
  const url = resolveStoredImageToUrl(
    raw,
    "eminence",
    img?.imageCategoryValue ?? "mobileDetailsPageBackground"
  )
  return url || null
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableEminenceRow({
  entry,
  onDeleteClick,
}: {
  entry: EminenceEntry
  onDeleteClick: (id: string, name: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const photo = getPhoto(entry.images)

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
          <span className="text-sm text-gray-400 w-5 text-right">{entry.order}</span>
        </div>
      </td>

      {/* Photo + name */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 relative rounded-full overflow-hidden bg-gray-100">
            {photo ? (
              <Image src={photo} alt={entry.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{entry.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[220px]">{entry.slug}</p>
          </div>
        </div>
      </td>

      {/* Country */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-600 truncate max-w-[140px]">{entry.countryName || "—"}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[entry.status] ?? statusStyle.Archived}`}>
          {entry.status}
        </span>
      </td>

      {/* Updated */}
      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
        {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/admin/eminence/${entry.id}/edit`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onDeleteClick(entry.id, entry.name)}
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

export default function EminenceTable({ entries }: EminenceTableProps) {
  const router = useRouter()
  const [localEntries, setLocalEntries] = useState<EminenceEntry[]>(entries)
  const [originalEntries, setOriginalEntries] = useState<EminenceEntry[]>(entries)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    entryId: string
    entryName: string
  }>({ isOpen: false, entryId: "", entryName: "" })
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    setLocalEntries(entries)
    setOriginalEntries(entries)
    setHasUnsavedChanges(false)
  }, [entries])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localEntries.findIndex((e) => e.id === active.id)
    const newIndex = localEntries.findIndex((e) => e.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(localEntries, oldIndex, newIndex).map((e, i) => ({
      ...e,
      order: i + 1,
    }))

    setLocalEntries(reordered)
    setHasUnsavedChanges(true)
  }

  const handleSaveOrder = async () => {
    setIsSaving(true)
    try {
      const updates = localEntries.map((e, i) => ({ id: e.id, order: i + 1 }))
      const res = await fetch("/api/eminence/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(`Failed to save order: ${data.error}`)
        return
      }

      setOriginalEntries([...localEntries])
      setHasUnsavedChanges(false)
      router.refresh()
    } catch {
      alert("An error occurred while saving the order.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetOrder = () => {
    setLocalEntries([...originalEntries])
    setHasUnsavedChanges(false)
  }

  const handleDeleteClick = (entryId: string, entryName: string) => {
    setConfirmDialog({ isOpen: true, entryId, entryName })
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/eminence/${confirmDialog.entryId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to delete entry")
        return
      }
      setConfirmDialog({ isOpen: false, entryId: "", entryName: "" })
      router.refresh()
    } catch {
      alert("Failed to delete entry")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, entryId: "", entryName: "" })
  }

  if (localEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No entries</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new Eminence entry.</p>
        <div className="mt-6">
          <Link href="/admin/eminence/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            New Entry
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <span className="font-medium text-amber-800">Unsaved changes to eminence order</span>
          <div className="flex items-center gap-2">
            <button onClick={handleResetOrder} disabled={isSaving} className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">Reset</button>
            <button onClick={handleSaveOrder} disabled={isSaving} className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localEntries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 w-20">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Person</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Updated</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localEntries.map((entry) => (
                <SortableEminenceRow key={entry.id} entry={entry} onDeleteClick={handleDeleteClick} />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Entry"
        message={`Are you sure you want to delete "${confirmDialog.entryName}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  )
}
