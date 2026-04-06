"use client"

import Link from "next/link"
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

interface Category {
  id: string
  slug: string
  name: string
  description: string
  isNews: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  _count: {
    articles: number
  }
}

interface CategoriesTableProps {
  categories: Category[]
}

// Sortable table row component
function SortableTableRow({
  category,
  onDeleteClick
}: {
  category: Category
  onDeleteClick: (category: Category) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'bg-gray-100 shadow-lg z-10' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="flex items-center">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mr-3 cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
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
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                category.isNews
                  ? 'bg-red-100 border-2 border-red-500'
                  : 'bg-blue-100 border-2 border-blue-500'
              }`}
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {category.name}
              </div>
              <div className="text-sm text-gray-500">
                {category.slug}
              </div>
            </div>
          </div>
          {category.description && (
            <div className="mt-1 ml-12 text-sm text-gray-500 max-w-xs truncate">
              {category.description}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          category.isNews
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {category.isNews ? 'News' : 'Content'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {category._count.articles}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {category.order}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDistanceToNow(new Date(category.updatedAt), { addSuffix: true })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900 hover:underline"
          >
            Edit
          </Link>
          <button
            onClick={() => onDeleteClick(category)}
            disabled={category._count.articles > 0}
            className={`${
              category._count.articles > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:text-red-900 hover:underline'
            }`}
            title={
              category._count.articles > 0
                ? `Cannot delete: ${category._count.articles} article(s) assigned`
                : 'Delete category'
            }
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  const [localCategories, setLocalCategories] = useState(categories)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    categoryId: string | null
    categoryName: string
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: ""
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDeleteClick = (category: Category) => {
    setDeleteDialog({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoryId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/categories/${deleteDialog.categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.refresh() // Refresh the page data
        setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" })
      } else {
        const errorData = await response.json()
        alert(`Failed to delete category: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('An error occurred while deleting the category')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = localCategories.findIndex((cat) => cat.id === active.id)
    const newIndex = localCategories.findIndex((cat) => cat.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Optimistically update the local state
    const newCategories = arrayMove(localCategories, oldIndex, newIndex)
    setLocalCategories(newCategories)

    // Update the order values based on new positions
    const updates = newCategories.map((category, index) => ({
      id: category.id,
      order: index + 1
    }))

    setIsUpdatingOrder(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates })
      })

      if (!response.ok) {
        // Revert on failure
        setLocalCategories(categories)
        const errorData = await response.json()
        alert(`Failed to update category order: ${errorData.error}`)
      } else {
        // Success - update local categories with new order values
        const updatedCategories = newCategories.map((category, index) => ({
          ...category,
          order: index + 1
        }))
        setLocalCategories(updatedCategories)
      }
    } catch (error) {
      // Revert on error
      setLocalCategories(categories)
      console.error('Error updating category order:', error)
      alert('An error occurred while updating the category order')
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  // Update local categories when props change (e.g., after delete)
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  if (localCategories.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No categories found</h3>
        <p className="text-sm text-gray-500 mb-4">Get started by creating a new category.</p>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Category
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {isUpdatingOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">Updating category order...</p>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localCategories.map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localCategories.map((category) => (
                <SortableTableRow
                  key={category.id}
                  category={category}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.categoryName}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  )
}