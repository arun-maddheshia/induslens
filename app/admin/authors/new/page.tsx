import AuthorForm from "../_components/AuthorForm"
import AuthenticatedLayout from "../../_components/AuthenticatedLayout"

export default async function NewAuthorPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Author</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new author profile to the system
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl">
          <AuthorForm isEdit={false} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}