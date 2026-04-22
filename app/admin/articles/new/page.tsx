import ArticleForm from "../_components/ArticleForm"

export default async function NewArticlePage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Create New Article</h1>
        <p className="mt-0.5 text-sm text-gray-500">Fill in the information below to create a new article</p>
      </div>
      <ArticleForm isEdit={false} />
    </div>
  )
}
