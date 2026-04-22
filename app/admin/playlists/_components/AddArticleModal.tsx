"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { resolveStoredImageToUrl } from "@/lib/image-storage"
import "../../admin.css"

export type PlaylistType = 'hero' | 'other-stories' | 'industales'

interface Article {
  id: string
  headline: string
  excerpt: string
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

interface AddArticleModalProps {
  type: PlaylistType
  onClose: () => void
  onArticleAdded: () => void
}

export default function AddArticleModal({ type, onClose, onArticleAdded }: AddArticleModalProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState("")

  // Load articles that can be added
  const loadArticles = async (query?: string) => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      params.set('exclude', type) // Exclude articles already in this playlist

      const response = await fetch(`/api/playlists/search?${params}`)

      if (!response.ok) {
        throw new Error('Failed to load articles')
      }

      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error loading articles:', error)
      setError(error instanceof Error ? error.message : 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  // Load articles on mount
  useEffect(() => {
    loadArticles()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        loadArticles(searchQuery)
      } else {
        loadArticles()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Add article to playlist
  const handleAddArticle = async (articleId: string) => {
    setAdding(articleId)
    setError("")

    try {
      const response = await fetch(`/api/playlists/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add article')
      }

      // Remove article from local list and notify parent
      setArticles(articles => articles.filter(article => article.id !== articleId))
      onArticleAdded()

    } catch (error) {
      console.error('Error adding article:', error)
      setError(error instanceof Error ? error.message : 'Failed to add article')
    } finally {
      setAdding(null)
    }
  }

  const getArticleImage = (article: Article) => {
    const image = article.images?.[0]
    const raw = image?.imageUrl?.[0]
    if (!raw) return null
    const url = resolveStoredImageToUrl(
      raw,
      "articles",
      image?.imageCategoryValue ?? "posterImage"
    )
    return url || null
  }

  const getModalTitle = () => {
    if (type === 'hero') return 'Add to Hero Playlist'
    if (type === 'industales') return 'Add to IndusTales Playlist'
    return 'Add to Other Stories'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{getModalTitle()}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by headline or excerpt..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Articles List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading articles...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery
                      ? `No articles match "${searchQuery}"`
                      : "All published articles are already in this playlist"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {articles.map((article) => {
                    const articleImage = getArticleImage(article)
                    const isAdding = adding === article.id

                    return (
                      <div
                        key={article.id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {/* Article Image */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {articleImage ? (
                            <Image
                              src={articleImage}
                              alt={article.headline}
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
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {article.headline}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {article.author && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {article.author.name}
                              </span>
                            )}

                            {article.publishedAt && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleAddArticle(article.id)}
                            disabled={isAdding}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAdding ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                              </>
                            ) : (
                              'Add'
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}