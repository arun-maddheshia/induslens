"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { resolveStoredImageToUrl } from "@/lib/image-storage"
import {
  useSortable
} from "@dnd-kit/sortable"
import {
  CSS
} from "@dnd-kit/utilities"
import "../../admin.css"

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
    author?: {
      id: string
      name: string
    } | null
    images: Array<{
      imageUrl: string[]
      imageCategoryValue?: string | null
    }>
  }
}

interface PlaylistItemProps {
  item: PlaylistItemData
  index: number
  onRemove: (itemId: string, articleTitle: string) => void
}

export default function PlaylistItem({ item, index, onRemove }: PlaylistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getArticleImage = () => {
    const image = item.article.images?.[0]
    const raw = image?.imageUrl?.[0]
    if (!raw) return null
    return resolveStoredImageToUrl(raw, "articles", image?.imageCategoryValue ?? "posterImage")
  }

  const articleImage = getArticleImage()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white border border-gray-200 rounded-lg p-4 transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50' : 'shadow-sm hover:shadow-md'
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

        {/* Article Image */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
          {articleImage ? (
            <Image
              src={articleImage}
              alt={item.article.headline}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Article Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.article.headline}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.article.excerpt}
              </p>

              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                {item.article.author && (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {item.article.author.name}
                  </span>
                )}

                {item.article.publishedAt && (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDistanceToNow(new Date(item.article.publishedAt), { addSuffix: true })}
                  </span>
                )}

                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  item.article.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800'
                    : item.article.status === 'DRAFT'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.article.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <a
                href={`/admin/articles/${item.article.id}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Edit article"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </a>

              <button
                onClick={() => onRemove(item.id, item.article.headline)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove from playlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}