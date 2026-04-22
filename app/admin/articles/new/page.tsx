import ArticleForm from "../_components/ArticleForm"

export default async function NewArticlePage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the information below to create a new article
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl">
          <ArticleForm isEdit={false} />
        </div>
      </div>
  )
}