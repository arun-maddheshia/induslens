"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import ConfirmDialog from "../../_components/ConfirmDialog"

interface Author {
  id: string
  name: string
  aboutTheAnchor: string
  email?: string | null
  slug: string
  status: string
  countryName?: string | null
  updatedAt: Date
  publishedAt?: Date | null
  images: Array<{
    id: string
    imageCategory: string
    imageUrl: string[]
  }>
  _count: {
    articles: number
  }
}

interface AuthorsTableProps {
  authors: Author[]
}

const statusColors = {
  Published: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Archived: "bg-red-100 text-red-800",
}

export default function AuthorsTable({ authors }: AuthorsTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    authorId: string | null
    authorName: string
  }>({
    isOpen: false,
    authorId: null,
    authorName: ""
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteClick = (authorId: string, authorName: string) => {
    setDeleteDialog({
      isOpen: true,
      authorId,
      authorName
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.authorId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/authors/${deleteDialog.authorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete author')
      }

      // Close dialog and refresh the page
      setDeleteDialog({ isOpen: false, authorId: null, authorName: "" })
      router.refresh()
    } catch (error) {
      console.error('Error deleting author:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete author')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, authorId: null, authorName: "" })
  }

  const getAuthorImage = (author: Author) => {
    const posterImage = author.images?.find(img => img.imageCategoryValue === 'posterImage')
    return posterImage?.imageUrl?.[0] || null
  }

  if (authors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No authors found.</p>
        <Link
          href="/admin/authors/new"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
        >
          Create your first author
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
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Articles
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
          {authors.map((author) => {
            const authorImage = getAuthorImage(author)

            return (
              <tr key={author.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {authorImage ? (
                        <Image
                          src={authorImage}
                          alt={author.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {author.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {author.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {author.email || author.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={clsx(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      statusColors[author.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                    )}
                  >
                    {author.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {author.countryName || "Not specified"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {author._count.articles}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(author.updatedAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/admin/authors/${author.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteClick(author.id, author.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Author"
        message={`Are you sure you want to delete "${deleteDialog.authorName}"? This action cannot be undone.`}
        confirmText="Delete Author"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  )
}