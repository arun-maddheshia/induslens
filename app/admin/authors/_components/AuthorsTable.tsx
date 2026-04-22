"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ConfirmDialog from "../../_components/ConfirmDialog"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

interface Author {
  id: string
  name: string
  aboutTheAnchor: string
  email?: string | null
  slug: string
  status: string
  countryName?: string | null
  order: number
  updatedAt: Date
  publishedAt?: Date | null
  images: Array<{
    id: string
    imageCategory: string
    imageCategoryValue?: string | null
    imageUrl: string[]
  }>
  _count: {
    articles: number
  }
}

interface AuthorsTableProps {
  authors: Author[]
}

const statusStyle: Record<string, string> = {
  Published: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  Draft:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  Archived:  "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
}

// Sortable author row component
function SortableAuthorRow({
  author,
  onDeleteClick
}: {
  author: Author;
  onDeleteClick: (authorId: string, authorName: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: author.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getAuthorImage = (author: Author) => {
    const profile =
      author.images?.find(
        (img) => img.imageCategoryValue === "mobileDetailsPageBackground"
      ) ||
      author.images?.find((img) => img.imageCategoryValue === "posterImage") ||
      author.images?.[0]
    const raw = profile?.imageUrl?.[0]
    if (!raw) return null
    const url = resolveStoredImageToUrl(
      raw,
      "authors",
      profile?.imageCategoryValue ?? "mobileDetailsPageBackground"
    )
    return url || null
  }

  const authorImage = getAuthorImage(author)

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors ${isDragging ? "bg-gray-50 shadow-sm z-10" : "hover:bg-gray-50/60"}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zM7 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zM7 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zM13 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2zM13 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zM13 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
            </svg>
          </button>
          <div className="flex-shrink-0 h-9 w-9">
            {authorImage ? (
              <Image src={authorImage} alt={author.name} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">{author.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{author.name}</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{author.email || author.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[author.status] ?? statusStyle.Archived}`}
        >
          {author.status}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
        {author.countryName || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
          {author._count.articles}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
        {author.order}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
        {formatDistanceToNow(new Date(author.updatedAt), { addSuffix: true })}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/admin/authors/${author.id}/edit`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={() => onDeleteClick(author.id, author.name)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function AuthorsTable({ authors }: AuthorsTableProps) {
  const [localAuthors, setLocalAuthors] = useState<Author[]>(authors)
  const [originalAuthors, setOriginalAuthors] = useState<Author[]>(authors)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    authorId: string | null
    authorName: string
  }>({
    isOpen: false,
    authorId: null,
    authorName: ""
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update local state when props change
  useEffect(() => {
    setLocalAuthors(authors)
    setOriginalAuthors(authors)
    setHasUnsavedChanges(false)
  }, [authors])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = localAuthors.findIndex((author) => author.id === active.id)
    const newIndex = localAuthors.findIndex((author) => author.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Update the local state with new order
    const newAuthors = arrayMove(localAuthors, oldIndex, newIndex)

    // Update order values based on new positions
    const updatedAuthors = newAuthors.map((author, index) => ({
      ...author,
      order: index + 1
    }))

    setLocalAuthors(updatedAuthors)
    setHasUnsavedChanges(true)
  }

  const handleSaveOrder = async () => {
    const updates = localAuthors.map((author, index) => ({
      id: author.id,
      order: index + 1
    }))

    setIsSaving(true)
    try {
      const response = await fetch('/api/authors/order', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates })
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(`Failed to update author order: ${errorData.error}`)
      } else {
        // Success - update the original authors and clear unsaved changes
        setOriginalAuthors([...localAuthors])
        setHasUnsavedChanges(false)
        router.refresh() // Refresh the page to show updated data
      }
    } catch (error) {
      console.error('Error saving author order:', error)
      alert('An error occurred while saving the author order')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetOrder = () => {
    setLocalAuthors([...originalAuthors])
    setHasUnsavedChanges(false)
  }

  const handleDeleteClick = (authorId: string, authorName: string) => {
    setDeleteDialog({
      isOpen: true,
      authorId,
      authorName
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.authorId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/authors/${deleteDialog.authorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete author')
      }

      // Close dialog and refresh the page
      setDeleteDialog({ isOpen: false, authorId: null, authorName: "" })
      router.refresh()
    } catch (error) {
      console.error('Error deleting author:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete author')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, authorId: null, authorName: "" })
  }

  if (localAuthors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-gray-500">No authors found.</p>
        <Link href="/admin/authors/new" className="mt-3 text-sm font-medium text-gray-900 underline underline-offset-2 hover:no-underline">
          Create your first author
        </Link>
      </div>
    )
  }

  return (
    <div>
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <span className="font-medium text-amber-800">Unsaved changes to author order</span>
          <div className="flex items-center gap-2">
            <button onClick={handleResetOrder} disabled={isSaving} className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
              Reset
            </button>
            <button onClick={handleSaveOrder} disabled={isSaving} className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localAuthors.map(a => a.id)} strategy={verticalListSortingStrategy}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Articles</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Modified</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localAuthors.map((author) => (
                <SortableAuthorRow key={author.id} author={author} onDeleteClick={handleDeleteClick} />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Author"
        message={`Are you sure you want to delete "${deleteDialog.authorName}"? This action cannot be undone.`}
        confirmText="Delete Author"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  )
}