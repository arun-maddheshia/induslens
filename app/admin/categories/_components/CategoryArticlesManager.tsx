"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
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

interface Article {
  id: string
  headline: string
  excerpt: string
  slug: string
  status: string
  publishedAt: Date | null
  categoryOrder: number | null
  author?: {
    id: string
    name: string
    slug: string
  } | null
  legacyAuthor?: {
    id: string
    name: string
    email: string
  } | null
}

interface CategoryArticlesManagerProps {
  categoryId: string
  categoryName: string
}

// Sortable article row component
function SortableArticleRow({ article }: { article: Article }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const authorName = article.author?.name || article.legacyAuthor?.name || 'Unknown'

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'bg-gray-100 shadow-lg z-10' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
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
          <div>
            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
              {article.headline}
            </div>
            <div className="text-sm text-gray-500 max-w-xs truncate">
              {article.excerpt}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {authorName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
          {article.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {article.categoryOrder || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {article.publishedAt
          ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
          : 'Not published'
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <a
          href={`/admin/articles/${article.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 hover:underline"
        >
          Edit
        </a>
      </td>
    </tr>
  )
}

export default function CategoryArticlesManager({ categoryId, categoryName }: CategoryArticlesManagerProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [originalArticles, setOriginalArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch articles for this category
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/categories/${categoryId}/articles?limit=100`)
        if (response.ok) {
          const data = await response.json()
          const fetchedArticles = data.articles || []
          setArticles(fetchedArticles)
          setOriginalArticles(fetchedArticles)
          setHasUnsavedChanges(false)
        } else {
          setError("Failed to load articles")
        }
      } catch (error) {
        console.error("Error fetching articles:", error)
        setError("Failed to load articles")
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchArticles()
    }
  }, [categoryId])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = articles.findIndex((article) => article.id === active.id)
    const newIndex = articles.findIndex((article) => article.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Update the local state with new order
    const newArticles = arrayMove(articles, oldIndex, newIndex)

    // Update categoryOrder values based on new positions
    const updatedArticles = newArticles.map((article, index) => ({
      ...article,
      categoryOrder: index + 1
    }))

    setArticles(updatedArticles)
    setHasUnsavedChanges(true)
  }

  const handleSaveOrder = async () => {
    const updates = articles.map((article, index) => ({
      id: article.id,
      categoryOrder: index + 1
    }))

    setIsSaving(true)
    try {
      const response = await fetch(`/api/categories/${categoryId}/articles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates })
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(`Failed to update article order: ${errorData.error}`)
      } else {
        // Success - update the original articles and clear unsaved changes
        setOriginalArticles([...articles])
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Error saving article order:', error)
      alert('An error occurred while saving the article order')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetOrder = () => {
    setArticles([...originalArticles])
    setHasUnsavedChanges(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-8 text-center">
          <div className="mx-auto h-12 w-12 text-red-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Articles</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-8 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No articles found</h3>
          <p className="text-sm text-gray-500 mb-4">
            This category doesn&apos;t have any articles yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Articles in &quot;{categoryName}&quot; ({articles.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop to reorder articles within this category
            </p>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-amber-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Unsaved changes
              </span>

              <button
                onClick={handleResetOrder}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>

              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
          )}
        </div>
      </div>

      <div className="overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={articles.map(article => article.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <SortableArticleRow
                    key={article.id}
                    article={article}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}