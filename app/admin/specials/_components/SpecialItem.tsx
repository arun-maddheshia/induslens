"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Pencil, Trash2, Tag } from "lucide-react"

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const categoryName = item.categoryRef?.name ?? "Unassigned"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 border border-gray-100 rounded-lg bg-white px-4 py-3 transition-shadow ${
        isDragging ? "shadow-md ring-1 ring-gray-200 z-10" : "hover:shadow-sm"
      }`}
    >
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

      <span className="flex-shrink-0 w-5 text-right text-xs font-medium text-gray-400">{index + 1}</span>

      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
        <Tag className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title || categoryName}</p>
        {item.description && (
          <p className="text-xs text-gray-500 truncate">{item.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          {categoryName} · {item.articleCount} article{item.articleCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item.id)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRemove(item.id, item.title || categoryName)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
