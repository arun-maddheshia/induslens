import { notFound } from "next/navigation"
import { getAuthorById } from "@/lib/db-authors"
import AuthorForm from "../../_components/AuthorForm"

interface EditAuthorPageProps {
  params: {
    id: string
  }
}

export default async function EditAuthorPage({ params }: EditAuthorPageProps) {
  const author = await getAuthorById(params.id)

  if (!author) {
    notFound()
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Author</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the author profile information
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl">
          <AuthorForm author={author} isEdit={true} />
        </div>
      </div>
  )
}