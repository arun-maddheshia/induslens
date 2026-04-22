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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Edit Author</h1>
        <p className="mt-0.5 text-sm text-gray-500">Update the author profile information</p>
      </div>
      <AuthorForm author={author} isEdit={true} />
    </div>
  )
}
