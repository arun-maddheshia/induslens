import { notFound } from "next/navigation"
import { getArticleById } from "@/lib/db"
import ArticleForm from "../../_components/ArticleForm"
import AuthenticatedLayout from "../../../_components/AuthenticatedLayout"

interface EditArticlePageProps {
  params: {
    id: string
  }
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const article = await getArticleById(params.id)

  if (!article) {
    notFound()
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the article information
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl">
          <ArticleForm article={article} isEdit={true} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}