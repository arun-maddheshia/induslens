import AuthenticatedLayout from "../_components/AuthenticatedLayout"
import CategoryManager from "./_components/CategoryManager"

export default function CategoriesPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage article categories with drag-and-drop reordering and article assignment</p>
        </div>

        <CategoryManager />
      </div>
    </AuthenticatedLayout>
  )
}