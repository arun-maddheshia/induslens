import { notFound } from "next/navigation"
import { getArticleById } from "@/lib/db"
import ArticleForm from "../../_components/ArticleForm"

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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Edit Article</h1>
        <p className="mt-0.5 text-sm text-gray-500">Update the article information</p>
      </div>
      <ArticleForm article={article} isEdit={true} />
    </div>
  )
}
