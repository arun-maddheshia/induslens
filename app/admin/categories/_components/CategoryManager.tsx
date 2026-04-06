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
import Link from "next/link"
import CategoryItem from "./CategoryItem"
import CategoryArticlesModal from "./CategoryArticlesModal"
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

export default function CategoryManager() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showArticlesModal, setShowArticlesModal] = useState<{ categoryId: string; categoryName: string } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    categoryId: string | null
    categoryName: string
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: ""
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load categories
  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/categories?limit=100') // Get all categories
      if (!response.ok) {
        throw new Error('Failed to load categories')
      }

      const data = await response.json()
      // Sort by order field
      const sortedCategories = (data.categories || []).sort((a: Category, b: Category) => a.order - b.order)
      setCategories(sortedCategories)
    } catch (error) {
      console.error('Error loading categories:', error)
      setError(error instanceof Error ? error.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load categories on mount
  useEffect(() => {
    loadCategories()
    setHasUnsavedChanges(false)
  }, [loadCategories])

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      setCategories((categories) => {
        const oldIndex = categories.findIndex((cat) => cat.id === active.id)
        const newIndex = categories.findIndex((cat) => cat.id === over?.id)

        const newCategories = arrayMove(categories, oldIndex, newIndex)
        setHasUnsavedChanges(true)
        return newCategories
      })
    }
  }

  // Save order changes
  const handleSaveOrder = async () => {
    setSaving(true)
    setError("")

    try {
      // Update categories with new order
      const updates = categories.map((category, index) => ({
        id: category.id,
        order: index + 1
      }))

      // Update each category individually
      await Promise.all(
        updates.map(({ id, order }) =>
          fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order }),
          })
        )
      )

      setHasUnsavedChanges(false)
      // Refresh categories to get updated data
      await loadCategories()
    } catch (error) {
      console.error('Error saving order:', error)
      setError(error instanceof Error ? error.message : 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  // Handle edit category
  const handleEditCategory = (categoryId: string) => {
    router.push(`/admin/categories/${categoryId}/edit`)
  }

  // Handle manage articles
  const handleManageArticles = (categoryId: string, categoryName: string) => {
    setShowArticlesModal({ categoryId, categoryName })
  }

  // Handle delete category
  const handleDeleteClick = (category: Category) => {
    setDeleteDialog({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoryId) return

    try {
      const response = await fetch(`/api/categories/${deleteDialog.categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      // Remove from local state
      setCategories(categories => categories.filter(cat => cat.id !== deleteDialog.categoryId))
      setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" })
    } catch (error) {
      console.error('Error deleting category:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Category Management</h2>
            <p className="text-sm text-gray-600">
              {categories.length} categories • Drag to reorder • Click to manage articles
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

            <Link
              href="/admin/categories/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </Link>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new category for organizing your articles.</p>
            <div className="mt-6">
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add First Category
              </Link>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-gray-200">
                {categories.map((category, index) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    index={index}
                    onEdit={handleEditCategory}
                    onManageArticles={handleManageArticles}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Manage Articles Modal */}
      {showArticlesModal && (
        <CategoryArticlesModal
          categoryId={showArticlesModal.categoryId}
          categoryName={showArticlesModal.categoryName}
          onClose={() => setShowArticlesModal(null)}
          onArticlesUpdated={loadCategories}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        type="danger"
      />
    </div>
  )
}