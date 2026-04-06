"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const searchParams = useSearchParams()

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        {currentPage > 1 && (
          <Link
            href={buildHref(currentPage - 1)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Previous
          </Link>
        )}
        {currentPage < totalPages && (
          <Link
            href={buildHref(currentPage + 1)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}
