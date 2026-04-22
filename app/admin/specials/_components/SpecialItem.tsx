"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SpecialItemData {
  id: string
  order: number
  title: string
  description: string
  categoryId: string | null
  categoryRef: { id: string; name: string; slug: string } | null
  articleCount: number
}

interface Props {
  item: SpecialItemData
  index: number
  onRemove: (id: string, name: string) => void
  onEdit: (id: string) => void
}

export default function SpecialItem({ item, index, onRemove, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const categoryName = item.categoryRef?.name ?? "Unassigned"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white border border-gray-200 rounded-lg p-4 transition-shadow ${
        isDragging ? "shadow-lg ring-2 ring-indigo-500 ring-opacity-50" : "shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
          title="Drag to reorder"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Order Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </div>

        {/* Category icon */}
        <div className="flex-shrink-0 w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
          <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">{item.title || categoryName}</h3>
          {item.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {categoryName} · {item.articleCount} article{item.articleCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(item.id)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(item.id, item.title || categoryName)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
