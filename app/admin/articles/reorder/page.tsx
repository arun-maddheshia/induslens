import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { db } from "@/lib/db"
import NewsArticlesReorder from "./_components/NewsArticlesReorder"

export default async function ReorderArticlesPage() {
  const categories = await db.category.findMany({
    where: { isNews: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  })

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Articles
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Reorder News Articles</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Drag articles to set their display order within each category
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          }
        >
          <NewsArticlesReorder categories={categories} />
        </Suspense>
      </div>
    </div>
  )
}
