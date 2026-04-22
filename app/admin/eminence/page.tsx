import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllEminence } from "@/lib/db-eminence"
import EminenceTable from "./_components/EminenceTable"
import EminenceFilters from "./_components/EminenceFilters"
import Pagination from "./_components/Pagination"

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
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex items-start justify-between flex-none">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Indus Eminence</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {result.total} entr{result.total !== 1 ? "ies" : "y"} · drag rows to reorder
          </p>
        </div>
        <Link
          href="/admin/eminence/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </Link>
      </div>

      <EminenceFilters />

      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 flex-none">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{result.items.length}</span> of{" "}
            <span className="font-medium text-gray-700">{result.total}</span> entries
          </p>
          {result.totalPages > 1 && (
            <p className="text-xs text-gray-500">Page {result.page} of {result.totalPages}</p>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <EminenceTable entries={result.items} />
        </div>
        {result.totalPages > 1 && (
          <div className="border-t border-gray-100 flex-none">
            <Pagination currentPage={result.page} totalPages={result.totalPages} baseUrl="/admin/eminence" />
          </div>
        )}
      </div>
    </div>
  )
}
