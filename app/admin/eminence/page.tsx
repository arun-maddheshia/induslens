import Link from "next/link"
import { getAllEminence } from "@/lib/db-eminence"
import EminenceTable from "./_components/EminenceTable"
import EminenceFilters from "./_components/EminenceFilters"
import Pagination from "./_components/Pagination"
import AuthenticatedLayout from "../_components/AuthenticatedLayout"

interface EminencePageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
    country?: string
  }>
}

export default async function EminencePage({ searchParams }: EminencePageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const filters = {
    status: params.status,
    search: params.search,
    country: params.country,
  }

  const result = await getAllEminence(page, 20, filters)

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Indus Eminence</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage Eminence profiles. Drag to reorder.
            </p>
          </div>
          <Link
            href="/admin/eminence/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Entry
          </Link>
        </div>

        <EminenceFilters />

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {result.items.length} of {result.total} entries
            </p>
            <div className="text-sm text-gray-500">
              Page {result.page} of {result.totalPages}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <EminenceTable entries={result.items} />
        </div>

        {result.totalPages > 1 && (
          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            baseUrl="/admin/eminence"
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}
