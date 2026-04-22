import AuthorForm from "../_components/AuthorForm"

export default async function NewAuthorPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Create New Author</h1>
        <p className="mt-0.5 text-sm text-gray-500">Add a new author profile to the system</p>
      </div>
      <AuthorForm isEdit={false} />
    </div>
  )
}
