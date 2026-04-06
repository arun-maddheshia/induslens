"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import clsx from "clsx"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        {/* Mobile pagination */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed">
            Previous
          </span>
        )}

        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed">
            Next
          </span>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Previous button */}
            {currentPage > 1 ? (
              <Link
                href={createPageUrl(currentPage - 1)}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                ←
              </Link>
            ) : (
              <span className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300 cursor-not-allowed">
                <span className="sr-only">Previous</span>
                ←
              </span>
            )}

            {/* Page numbers */}
            {visiblePages.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                  >
                    ...
                  </span>
                )
              }

              const pageNum = page as number
              const isCurrentPage = pageNum === currentPage

              return (
                <Link
                  key={pageNum}
                  href={createPageUrl(pageNum)}
                  className={clsx(
                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
                    isCurrentPage
                      ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      : "text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {pageNum}
                </Link>
              )
            })}

            {/* Next button */}
            {currentPage < totalPages ? (
              <Link
                href={createPageUrl(currentPage + 1)}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                →
              </Link>
            ) : (
              <span className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300 cursor-not-allowed">
                <span className="sr-only">Next</span>
                →
              </span>
            )}
          </nav>
        </div>
      </div>
    </nav>
  )
}