"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import clsx from "clsx"
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

const statusColors = {
  Published: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Archived: "bg-red-100 text-red-800",
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
    const posterImage = author.images?.find(img => img.imageCategoryValue === 'posterImage')
    return posterImage?.imageUrl?.[0] || null
  }

  const authorImage = getAuthorImage(author)

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'bg-gray-100 shadow-lg z-10' : ''}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zM7 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zM7 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zM13 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2zM13 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zM13 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
            </svg>
          </button>
          <div className="flex-shrink-0 h-10 w-10">
            {authorImage ? (
              <Image
                src={authorImage}
                alt={author.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {author.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="max-w-xs">
            <div className="text-sm font-medium text-gray-900 truncate">
              {author.name}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {author.email || author.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={clsx(
            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
            statusColors[author.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
          )}
        >
          {author.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {author.countryName || "Not specified"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {author._count.articles}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {author.order}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDistanceToNow(new Date(author.updatedAt), { addSuffix: true })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <Link
          href={`/admin/authors/${author.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Edit
        </Link>
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => onDeleteClick(author.id, author.name)}
        >
          Delete
        </button>
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
      <div className="text-center py-12">
        <p className="text-gray-500">No authors found.</p>
        <Link
          href="/admin/authors/new"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
        >
          Create your first author
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Save Order Controls */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-amber-800">
                You have unsaved changes to the author order
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetOrder}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-md shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="px-4 py-1.5 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                  'Save Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localAuthors.map(author => author.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localAuthors.map((author) => (
                  <SortableAuthorRow
                    key={author.id}
                    author={author}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

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