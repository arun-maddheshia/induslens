import { notFound } from "next/navigation"
import { getCategoryById } from "@/lib/db-categories"
import CategoryForm from "../../_components/CategoryForm"
import CategoryArticlesManager from "../../_components/CategoryArticlesManager"

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const category = await getCategoryById(params.id)

  if (!category) {
    notFound()
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
          <p className="text-gray-600">
            Modify the category details.
            {category._count.articles > 0 && (
              <span className="text-amber-600 ml-2">
                This category has {category._count.articles} article(s) assigned.
              </span>
            )}
          </p>
        </div>

        <CategoryForm category={category} isEdit={true} />

        {/* Article Management Section */}
        <div className="mt-8">
          <CategoryArticlesManager
            categoryId={category.id}
            categoryName={category.name}
          />
        </div>
      </div>
  )
}

export async function generateMetadata({ params }: EditCategoryPageProps) {
  const category = await getCategoryById(params.id)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `Edit ${category.name} - Categories - Admin`,
    description: `Edit the ${category.name} category`,
  }
}