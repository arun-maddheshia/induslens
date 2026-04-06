"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"

interface Article {
  id: string
  headline: string
  excerpt: string
  status: string
  publishedAt: Date | null
  updatedAt: Date
  author?: {
    name: string | null
  } | null
}

interface CategoryArticlesModalProps {
  categoryId: string
  categoryName: string
  onClose: () => void
  onArticlesUpdated: () => void
}

export default function CategoryArticlesModal({
  categoryId,
  categoryName,
  onClose,
  onArticlesUpdated,
}: CategoryArticlesModalProps) {
  const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned')
  const [assignedArticles, setAssignedArticles] = useState<Article[]>([])
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Load articles
  const loadArticles = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      // Load assigned articles
      const assignedResponse = await fetch(`/api/articles?categoryId=${categoryId}&limit=100`)
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json()
        setAssignedArticles(assignedData.articles || [])
      }

      // Load available articles (not assigned to this category)
      const availableResponse = await fetch(`/api/articles?unassignedToCategory=${categoryId}&limit=100`)
      if (availableResponse.ok) {
        const availableData = await availableResponse.json()
        setAvailableArticles(availableData.articles || [])
      }
    } catch (error) {
      console.error('Error loading articles:', error)
      setError(error instanceof Error ? error.message : 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  // Assign article to category
  const handleAssignArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, category: categoryId }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign article to category')
      }

      // Refresh the article lists
      await loadArticles()
      onArticlesUpdated()
    } catch (error) {
      console.error('Error assigning article:', error)
      setError(error instanceof Error ? error.message : 'Failed to assign article')
    }
  }

  // Remove article from category
  const handleRemoveArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId: null, category: null }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove article from category')
      }

      // Refresh the article lists
      await loadArticles()
      onArticlesUpdated()
    } catch (error) {
      console.error('Error removing article:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove article')
    }
  }

  const filteredAssignedArticles = assignedArticles.filter(article =>
    article.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAvailableArticles = availableArticles.filter(article =>
    article.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-800",
    PUBLISHED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-red-100 text-red-800",
  }

  const ArticleList = ({ articles, showAssign }: { articles: Article[], showAssign: boolean }) => (
    <div className="space-y-3">
      {articles.map((article) => (
        <div key={article.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {article.headline}
              </h4>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[article.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                }`}>
                  {article.status}
                </span>
                {article.author?.name && (
                  <span>By {article.author.name}</span>
                )}
                <span>Updated {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="ml-4">
              {showAssign ? (
                <button
                  onClick={() => handleAssignArticle(article.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Assign
                </button>
              ) : (
                <button
                  onClick={() => handleRemoveArticle(article.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {articles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {showAssign ? 'No available articles to assign' : 'No articles assigned to this category'}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Manage Articles: {categoryName}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Assign and remove articles from this category
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={`${
                    activeTab === 'assigned'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Assigned Articles ({filteredAssignedArticles.length})
                </button>
                <button
                  onClick={() => setActiveTab('available')}
                  className={`${
                    activeTab === 'available'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Available Articles ({filteredAvailableArticles.length})
                </button>
              </nav>
            </div>

            {/* Article lists */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading articles...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'assigned' && (
                    <ArticleList articles={filteredAssignedArticles} showAssign={false} />
                  )}
                  {activeTab === 'available' && (
                    <ArticleList articles={filteredAvailableArticles} showAssign={true} />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}