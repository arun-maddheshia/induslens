"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { formatDistanceToNow } from "date-fns"
import { Pencil, Trash2, FileText } from "lucide-react"

interface Category {
  id: string
  slug: string
  name: string
  description: string
  isNews: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  _count: { articles: number }
}

interface Props {
  category: Category
  index: number
  showDragHandle?: boolean
  onEdit: (categoryId: string) => void
  onManageArticles: (categoryId: string, categoryName: string) => void
  onDelete: (category: Category) => void
}

export default function CategoryItem({ category, index, showDragHandle = true, onEdit, onManageArticles, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors ${isDragging ? "bg-gray-50 shadow-sm z-10" : "hover:bg-gray-50/60"}`}
    >
      {/* Order + drag handle */}
      {showDragHandle && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
              aria-label="Drag to reorder"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zM7 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zM7 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zM13 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2zM13 8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zM13 14a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
              </svg>
            </button>
            <span className="text-sm text-gray-400 w-5 text-right">{index + 1}</span>
          </div>
        </td>
      )}

      {/* Name + description */}
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{category.name}</p>
          {category.description && (
            <p className="text-xs text-gray-400 truncate max-w-[300px]">{category.description}</p>
          )}
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          category.isNews
            ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
            : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
        }`}>
          {category.isNews ? "News" : "Content"}
        </span>
      </td>

      {/* Articles count */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
          {category._count.articles}
        </span>
      </td>

      {/* Updated */}
      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
        {formatDistanceToNow(new Date(category.updatedAt), { addSuffix: true })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onManageArticles(category.id, category.name)}
            className="flex h-7 items-center gap-1 px-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-xs"
            title={`Manage articles in ${category.name}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Articles</span>
          </button>
          <button
            onClick={() => onEdit(category.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title={`Edit ${category.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(category)}
            disabled={category._count.articles > 0}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              category._count.articles > 0
                ? `Cannot delete: ${category._count.articles} article(s) assigned`
                : `Delete ${category.name}`
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
