import Link from "next/link"
import { getAllArticles } from "@/lib/db"
import ArticlesTable from "./_components/ArticlesTable"
import ArticleFilters from "./_components/ArticleFilters"
import Pagination from "./_components/Pagination"
import AuthenticatedLayout from "../_components/AuthenticatedLayout"

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

  const result = await getAllArticles(page, 10, filters)

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your content articles
            </p>
          </div>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Article
          </Link>
        </div>

        {/* Filters */}
        <ArticleFilters />

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {result.articles.length} of {result.total} articles
            </p>
            <div className="text-sm text-gray-500">
              Page {result.page} of {result.totalPages}
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ArticlesTable articles={result.articles} />
        </div>

        {/* Pagination */}
        {result.totalPages > 1 && (
          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            baseUrl="/admin/articles"
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}