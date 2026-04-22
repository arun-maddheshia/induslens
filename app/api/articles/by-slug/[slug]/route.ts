import { NextResponse } from "next/server"
import { getArticleBySlug } from "@/lib/db"
import { hydratePostImages } from "@/lib/image-storage"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const article = await getArticleBySlug(slug)

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    const hydratedImages = hydratePostImages(
      (article.images || []).map((img) => ({
        imageCategory: img.imageCategory || "",
        imageCategoryValue: img.imageCategoryValue || "",
        imageDescription: img.imageDescription || "",
        imageUrl: img.imageUrl || [],
        key: article.id,
      })),
      "articles"
    )

    const response: Article = {
      _id: article.id,
      headline: article.headline || "",
      alternativeHeadline: article.alternativeHeadline || "",
      excerpt: article.excerpt || "",
      articleBody: article.articleBody || "",
      pageContent: article.pageContent || "",
      diveContent: article.diveContent || "",
      datePublished: article.publishedAt?.toISOString() || "",
      dateCreated: article.createdAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      createdAt: article.createdAt.toISOString(),
      publishedAt: article.publishedAt?.toISOString() || "",
      author: article.author ? [{ id: article.author.id, name: article.author.name || "" }] : [],
      categories: article.categoryRef ? [article.categoryRef.id] : [],
      category: article.categoryRef?.id || article.category || "",
      categorySlug: article.categoryRef?.slug || "",
      newsType: "",
      agency: "",
      ampValidationMessage: "",
      archivedAt: "",
      contentType: (article.contentType as any) || "articles",
      editor: "",
      expires: "",
      genre: article.genre || [],
      keywords: article.keywords || [],
      language: article.language || "en",
      locationCreated: "",
      mainEntityOfPage: "",
      metaDescription: article.metaDescription || "",
      metaTitle: article.metaTitle || "",
      publisher: "",
      siteId: article.siteId || "",
      sourceType: "",
      subCategories: article.subCategories || [],
      tags: article.tags || [],
      url: `/category/${article.categoryRef?.slug}/${article.slug}`,
      key: parseInt(article.id.slice(-6), 16),
      isContent: true,
      description: article.excerpt || "",
      name: article.headline || "",
      slug: article.slug || "",
      status: article.status,
      visibility: article.visibility ?? true,
      optionalfield: "",
      images: hydratedImages,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching article by slug:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
