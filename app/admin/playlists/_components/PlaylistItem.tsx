"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { resolveStoredImageToUrl } from "@/lib/image-storage"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface PlaylistItemData {
  id: string
  order: number
  articleId: string
  article: {
    id: string
    headline: string
    excerpt: string
    status: string
    publishedAt: Date | null
    author?: { id: string; name: string } | null
    images: Array<{ imageUrl: string[]; imageCategoryValue?: string | null }>
  }
}

interface Props {
  item: PlaylistItemData
  index: number
  onRemove: (itemId: string, articleTitle: string) => void
}

const statusStyle: Record<string, string> = {
  PUBLISHED: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  DRAFT:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  ARCHIVED:  "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
}

export default function PlaylistItem({ item, index, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const image = item.article.images?.[0]
  const raw = image?.imageUrl?.[0]
  const articleImage = raw
    ? resolveStoredImageToUrl(raw, "articles", image?.imageCategoryValue ?? "posterImage")
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 border border-gray-100 rounded-lg bg-white px-4 py-3 transition-shadow ${
        isDragging ? "shadow-md ring-1 ring-gray-200 z-10" : "hover:shadow-sm"
      }`}
    >
      {/* Drag handle */}
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

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
        {articleImage ? (
          <Image src={articleImage} alt={item.article.headline} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Article info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate max-w-[400px]">{item.article.headline}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {item.article.author && (
            <span className="text-xs text-gray-400">{item.article.author.name}</span>
          )}
          {item.article.publishedAt && (
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(item.article.publishedAt), { addSuffix: true })}
            </span>
          )}
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[item.article.status] ?? statusStyle.ARCHIVED}`}>
            {item.article.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/admin/articles/${item.article.id}/edit`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Edit article"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => onRemove(item.id, item.article.headline)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Remove from playlist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
