"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { X } from "lucide-react"
import { resolveStoredImageToUrl } from "@/lib/image-storage"

export type PlaylistType = "hero" | "other-stories" | "industales" | "industales-other-stories"

interface Article {
  id: string
  headline: string
  excerpt: string
  publishedAt: Date | null
  author?: { id: string; name: string } | null
  images: Array<{ imageUrl: string[]; imageCategoryValue?: string | null }>
}

interface Props {
  type: PlaylistType
  onClose: () => void
  onArticleAdded: () => void
}

export default function AddArticleModal({ type, onClose, onArticleAdded }: Props) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadArticles = async (query?: string) => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      params.set("exclude", type)
      const response = await fetch(`/api/playlists/search?${params}`)
      if (!response.ok) throw new Error("Failed to load articles")
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load articles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadArticles() }, [])

  useEffect(() => {
    const id = setTimeout(() => loadArticles(searchQuery || undefined), 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  const handleAddArticle = async (articleId: string) => {
    setAdding(articleId)
    setError("")
    try {
      const response = await fetch(`/api/playlists/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add article")
      }
      setArticles((articles) => articles.filter((a) => a.id !== articleId))
      onArticleAdded()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add article")
    } finally {
      setAdding(null)
    }
  }

  const getModalTitle = () => {
    if (type === "hero") return "Add to Hero Playlist"
    if (type === "industales") return "Add to IndusTales Featured Playlist"
    if (type === "industales-other-stories") return "Add to IndusTales Other Stories"
    return "Add to Other Stories"
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">{getModalTitle()}</h3>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by headline or excerpt…"
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 mb-3"
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 mb-3 text-sm text-red-700">{error}</div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                  Loading…
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {searchQuery ? `No articles match "${searchQuery}"` : "All published articles are already in this playlist"}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {articles.map((article) => {
                    const image = article.images?.[0]
                    const raw = image?.imageUrl?.[0]
                    const articleImage = raw
                      ? resolveStoredImageToUrl(raw, "articles", image?.imageCategoryValue ?? "posterImage")
                      : null

                    return (
                      <div
                        key={article.id}
                        className="flex items-center gap-3 px-3 py-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-9 relative rounded overflow-hidden bg-gray-100">
                          {articleImage ? (
                            <Image src={articleImage} alt={article.headline} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{article.headline}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {article.author && <span>{article.author.name}</span>}
                            {article.publishedAt && (
                              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddArticle(article.id)}
                          disabled={adding === article.id}
                          className="flex-shrink-0 rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          {adding === article.id ? "Adding…" : "Add"}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
