"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import clsx from "clsx"

interface Article {
  id: string
  headline: string
  excerpt: string
  status: string
  category: string
  publishedAt: Date | null
  updatedAt: Date
  author?: {
    name: string | null
    email: string
  } | null
  editor?: {
    name: string | null
    email: string
  } | null
}

interface ArticlesTableProps {
  articles: Article[]
}

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-red-100 text-red-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
}

export default function ArticlesTable({ articles }: ArticlesTableProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles found.</p>
        <Link
          href="/admin/articles/new"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
        >
          Create your first article
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Article
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Modified
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="max-w-sm">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {article.headline}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-1">
                    {article.excerpt}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={clsx(
                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                    statusColors[article.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                  )}
                >
                  {article.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {article.category || "Uncategorized"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {article.author?.name || article.author?.email || "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </Link>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this article?")) {
                      // TODO: Implement delete functionality
                      console.log("Delete article:", article.id)
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Add date-fns import note for the user
// Note: You'll need to install date-fns: npm install date-fns