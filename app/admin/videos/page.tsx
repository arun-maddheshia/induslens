import Link from "next/link"
import { getAllVideos } from "@/lib/db-videos"
import VideosTable from "./_components/VideosTable"
import VideoFilters from "./_components/VideoFilters"
import Pagination from "./_components/Pagination"
import AuthenticatedLayout from "../_components/AuthenticatedLayout"

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

  const result = await getAllVideos(page, 10, filters)

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your video content. Drag to reorder.
            </p>
          </div>
          <Link
            href="/admin/videos/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Video
          </Link>
        </div>

        <VideoFilters />

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {result.videos.length} of {result.total} videos
            </p>
            <div className="text-sm text-gray-500">
              Page {result.page} of {result.totalPages}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <VideosTable videos={result.videos} />
        </div>

        {result.totalPages > 1 && (
          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            baseUrl="/admin/videos"
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}
