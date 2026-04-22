import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllAuthors } from "@/lib/db-authors"
import AuthorsTable from "./_components/AuthorsTable"
import AuthorFilters from "./_components/AuthorFilters"
import Pagination from "./_components/Pagination"

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

  const result = await getAllAuthors(page, 20, filters)

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-none">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Authors</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {result.total} author{result.total !== 1 ? "s" : ""} · drag rows to reorder
          </p>
        </div>
        <Link
          href="/admin/authors/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Author
        </Link>
      </div>

      {/* Filters */}
      <AuthorFilters />

      {/* Table card */}
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 flex-none">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{result.authors.length}</span> of{" "}
            <span className="font-medium text-gray-700">{result.total}</span> authors
          </p>
          {result.totalPages > 1 && (
            <p className="text-xs text-gray-500">Page {result.page} of {result.totalPages}</p>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <AuthorsTable authors={result.authors} />
        </div>
        {result.totalPages > 1 && (
          <div className="border-t border-gray-100 flex-none">
            <Pagination currentPage={result.page} totalPages={result.totalPages} baseUrl="/admin/authors" />
          </div>
        )}
      </div>
    </div>
  )
}
