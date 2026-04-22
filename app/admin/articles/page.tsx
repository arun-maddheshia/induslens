import Link from "next/link"
import { Plus, GripVertical } from "lucide-react"
import { getAllArticles } from "@/lib/db"
import ArticlesTable from "./_components/ArticlesTable"
import ArticleFilters from "./_components/ArticleFilters"
import Pagination from "./_components/Pagination"

interface ArticlesPageProps {
  searchParams: {
    page?: string
    status?: string
    category?: string
    search?: string
  }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const page = parseInt(searchParams.page ?? "1")
  const filters = {
    status: searchParams.status,
    category: searchParams.category,
    search: searchParams.search,
  }

  const result = await getAllArticles(page, 20, filters)

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-none">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Articles</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {result.total} article{result.total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles/reorder"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <GripVertical className="h-4 w-4" />
            Reorder
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>

      {/* Filters */}
      <ArticleFilters />

      {/* Table card — fills remaining height */}
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Table meta row */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 flex-none">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{result.articles.length}</span> of{" "}
            <span className="font-medium text-gray-700">{result.total}</span> articles
          </p>
          {result.totalPages > 1 && (
            <p className="text-xs text-gray-500">
              Page {result.page} of {result.totalPages}
            </p>
          )}
        </div>

        {/* Scrollable table */}
        <div className="flex-1 min-h-0 overflow-auto">
          <ArticlesTable articles={result.articles} />
        </div>

        {/* Pagination pinned to bottom */}
        {result.totalPages > 1 && (
          <div className="border-t border-gray-100 flex-none">
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              baseUrl="/admin/articles"
            />
          </div>
        )}
      </div>
    </div>
  )
}
