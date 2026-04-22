import { Suspense } from "react"
import CategoryManager from "./_components/CategoryManager"
import CategoryFilters from "./_components/CategoryFilters"

export default function CategoriesPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex-none">
        <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage article categories · drag to reorder
        </p>
      </div>
      <div className="flex-none">
        <Suspense>
          <CategoryFilters />
        </Suspense>
      </div>
      <div className="flex-1 min-h-0">
        <Suspense>
          <CategoryManager />
        </Suspense>
      </div>
    </div>
  )
}
