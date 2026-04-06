"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { formatDistanceToNow } from "date-fns"

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

interface CategoryItemProps {
  category: Category
  index: number
  onEdit: (categoryId: string) => void
  onManageArticles: (categoryId: string, categoryName: string) => void
  onDelete: (category: Category) => void
}

export default function CategoryItem({
  category,
  index,
  onEdit,
  onManageArticles,
  onDelete,
}: CategoryItemProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      className={`p-6 hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50 bg-gray-100' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Order Number */}
        <div className="flex-shrink-0 w-8 text-center">
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
        </div>

        {/* Category Type Indicator */}
        <div className="flex-shrink-0">
          <div
            className={`w-4 h-4 rounded-full ${
              category.isNews
                ? 'bg-red-100 border-2 border-red-500'
                : 'bg-blue-100 border-2 border-blue-500'
            }`}
            title={category.isNews ? 'News Category' : 'Content Category'}
          />
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {category.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.isNews
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {category.isNews ? 'News' : 'Content'}
            </span>
          </div>

          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
            <span>/{category.slug}</span>
            <span>•</span>
            <span>{category._count.articles} article{category._count.articles !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Updated {formatDistanceToNow(new Date(category.updatedAt), { addSuffix: true })}</span>
          </div>

          {category.description && (
            <p className="mt-1 text-sm text-gray-600 truncate max-w-md">
              {category.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onManageArticles(category.id, category.name)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title={`Manage articles in ${category.name}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Articles
          </button>

          <button
            onClick={() => onEdit(category.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title={`Edit ${category.name}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          <button
            onClick={() => onDelete(category)}
            disabled={category._count.articles > 0}
            className={`inline-flex items-center px-3 py-2 border shadow-sm text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              category._count.articles > 0
                ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500'
            }`}
            title={
              category._count.articles > 0
                ? `Cannot delete: ${category._count.articles} article(s) assigned`
                : `Delete ${category.name}`
            }
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}