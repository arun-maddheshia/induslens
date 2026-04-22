import Link from "next/link"
import { getAllAuthors } from "@/lib/db-authors"
import AuthorsTable from "./_components/AuthorsTable"
import AuthorFilters from "./_components/AuthorFilters"
import Pagination from "./_components/Pagination"
import AuthenticatedLayout from "../_components/AuthenticatedLayout"

interface AuthorsPageProps {
  searchParams: {
    page?: string
    status?: string
    search?: string
    siteId?: string
  }
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const page = parseInt(searchParams.page ?? "1")
  const filters = {
    status: searchParams.status,
    search: searchParams.search,
    siteId: searchParams.siteId,
  }

  const result = await getAllAuthors(page, 10, filters)

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your content authors and contributors. Drag to reorder.
            </p>
          </div>
          <Link
            href="/admin/authors/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Author
          </Link>
        </div>

        {/* Filters */}
        <AuthorFilters />

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {result.authors.length} of {result.total} authors
            </p>
            <div className="text-sm text-gray-500">
              Page {result.page} of {result.totalPages}
            </div>
          </div>
        </div>

        {/* Authors Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <AuthorsTable authors={result.authors} />
        </div>

        {/* Pagination */}
        {result.totalPages > 1 && (
          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            baseUrl="/admin/authors"
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}