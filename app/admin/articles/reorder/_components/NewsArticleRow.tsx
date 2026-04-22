"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { formatDistanceToNow } from "date-fns"

interface Article {
  id: string
  headline: string
  excerpt?: string | null
  status: string
  categoryOrder: number | null
  updatedAt: Date
}

interface Props {
  article: Article
  index: number
}

const statusStyle: Record<string, string> = {
  DRAFT:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  PUBLISHED: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  ARCHIVED:  "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
}

export default function NewsArticleRow({ article, index }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: article.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors ${isDragging ? "bg-gray-50 shadow-sm z-10" : "hover:bg-gray-50/60"}`}
    >
      {/* Drag handle + order number */}
      <td className="px-4 py-3 w-20">
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

      {/* Headline + excerpt */}
      <td className="px-4 py-3">
        <div className="min-w-0 max-w-lg">
          <p className="text-sm font-medium text-gray-900 truncate leading-snug">
            {article.headline}
          </p>
          {article.excerpt && (
            <p className="mt-0.5 text-xs text-gray-400 truncate">
              {article.excerpt}
            </p>
          )}
        </div>
      </td>

      {/* Status badge */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            statusStyle[article.status] ?? statusStyle.ARCHIVED
          }`}
        >
          {article.status.charAt(0) + article.status.slice(1).toLowerCase()}
        </span>
      </td>

      {/* Modified time */}
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
        {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
      </td>
    </tr>
  )
}
