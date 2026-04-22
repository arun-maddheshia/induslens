"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const getPages = () => {
    const delta = 2
    const pages: (number | "…")[] = []

    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    if (left > 2) pages.push(1, "…")
    else pages.push(1)

    for (let i = left; i <= right; i++) pages.push(i)

    if (right < totalPages - 1) pages.push("…", totalPages)
    else if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  if (totalPages <= 1) return null

  const pages = getPages()
  const btnBase = "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors"

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-xs text-gray-400">
        Page {currentPage} of {totalPages}
      </p>
      <nav className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} className={cn(btnBase, "text-gray-500 hover:bg-gray-100")}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className={cn(btnBase, "cursor-not-allowed text-gray-300")}>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {pages.map((page, i) =>
          page === "…" ? (
            <span key={`dots-${i}`} className={cn(btnBase, "text-gray-400 cursor-default")}>…</span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page as number)}
              className={cn(
                btnBase,
                page === currentPage
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {page}
            </Link>
          )
        )}

        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} className={cn(btnBase, "text-gray-500 hover:bg-gray-100")}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={cn(btnBase, "cursor-not-allowed text-gray-300")}>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    </div>
  )
}
