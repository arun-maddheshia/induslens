import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllVideos } from "@/lib/db-videos"
import VideosTable from "./_components/VideosTable"
import VideoFilters from "./_components/VideoFilters"
import Pagination from "./_components/Pagination"

interface VideosPageProps {
  searchParams: {
    page?: string
    status?: string
    category?: string
    search?: string
  }
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const page = parseInt(searchParams.page ?? "1")
  const filters = {
    status: searchParams.status,
    category: searchParams.category,
    search: searchParams.search,
  }

  const result = await getAllVideos(page, 20, filters)

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex items-start justify-between flex-none">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Videos</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {result.total} video{result.total !== 1 ? "s" : ""} · drag rows to reorder
          </p>
        </div>
        <Link
          href="/admin/videos/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Video
        </Link>
      </div>

      <VideoFilters />

      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 flex-none">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{result.videos.length}</span> of{" "}
            <span className="font-medium text-gray-700">{result.total}</span> videos
          </p>
          {result.totalPages > 1 && (
            <p className="text-xs text-gray-500">Page {result.page} of {result.totalPages}</p>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <VideosTable videos={result.videos} />
        </div>
        {result.totalPages > 1 && (
          <div className="border-t border-gray-100 flex-none">
            <Pagination currentPage={result.page} totalPages={result.totalPages} baseUrl="/admin/videos" />
          </div>
        )}
      </div>
    </div>
  )
}
