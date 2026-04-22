"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import ConfirmDialog from "../../_components/ConfirmDialog"

interface Article {
  id: string
  headline: string
  excerpt: string
  status: string
  category: string | null
  publishedAt: Date | null
  updatedAt: Date
  author?: { name: string | null; email: string | null } | null
  editor?: { name: string | null; email: string | null } | null
}

const statusStyle: Record<string, string> = {
  DRAFT:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  PUBLISHED: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  ARCHIVED:  "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
}

export default function ArticlesTable({ articles }: { articles: Article[] }) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean; articleId: string | null; articleTitle: string
  }>({ isOpen: false, articleId: null, articleTitle: "" })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const openDelete = (id: string, title: string) =>
    setDeleteDialog({ isOpen: true, articleId: id, articleTitle: title })

  const cancelDelete = () =>
    setDeleteDialog({ isOpen: false, articleId: null, articleTitle: "" })

  const confirmDelete = async () => {
    if (!deleteDialog.articleId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/articles/${deleteDialog.articleId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      cancelDelete()
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete article")
    } finally {
      setIsDeleting(false)
    }
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-gray-500">No articles found.</p>
        <Link
          href="/admin/articles/new"
          className="mt-3 text-sm font-medium text-gray-900 underline underline-offset-2 hover:no-underline"
        >
          Create your first article
        </Link>
      </div>
    )
  }

  return (
    <>
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 w-[40%]">
              Article
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Author
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Modified
            </th>
            <th className="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {articles.map((article) => (
            <tr key={article.id} className="group hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-3">
                <div className="max-w-sm">
                  <p className="font-medium text-gray-900 truncate leading-snug">
                    {article.headline}
                  </p>
                  {article.excerpt && (
                    <p className="mt-0.5 text-xs text-gray-400 truncate">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[article.status] ?? statusStyle.ARCHIVED}`}>
                  {article.status.charAt(0) + article.status.slice(1).toLowerCase()}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                {article.category || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                {article.author?.name || article.author?.email || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => openDelete(article.id, article.headline)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteDialog.articleTitle}"? This action cannot be undone.`}
        confirmText="Delete Article"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />
    </>
  )
}
