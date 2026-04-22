import CategoryForm from "../_components/CategoryForm"

export default function NewCategoryPage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
          <p className="text-gray-600">Create a new category for organizing articles</p>
        </div>

        <CategoryForm />
      </div>
  )
}