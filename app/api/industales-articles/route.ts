import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hydratePostImages } from "@/lib/image-storage";

export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: {
        siteId: "industales",
        status: "PUBLISHED",
        visibility: true,
      },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, slug: true } },
        images: {
          select: {
            imageCategory: true,
            imageCategoryValue: true,
            imageDescription: true,
            imageUrl: true,
          },
        },
        categoryRef: { select: { id: true, name: true, slug: true, isNews: true } },
      },
    });

    const data: Article[] = articles.map((article) => ({
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
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      publishedAt: article.publishedAt?.toISOString() || "",
      author: article.author ? [{ id: article.author.id, name: article.author.name || "" }] : [],
      categories: article.categoryRef ? [article.categoryRef.id] : [],
      category: article.categoryRef?.id || article.category || "",
      categoryIsNews: article.categoryRef?.isNews ?? false,
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
      url: `/industales/${article.slug}`,
      key: parseInt(article.id.slice(-6), 16),
      isContent: true,
      description: article.excerpt || "",
      name: article.headline || "",
      slug: article.slug || "",
      status: article.status,
      visibility: article.visibility ?? true,
      optionalfield: "",
      images: hydratePostImages(
        (article.images || []).map((img) => ({
          imageCategory: img.imageCategory || "",
          imageCategoryValue: img.imageCategoryValue || "",
          imageDescription: img.imageDescription || "",
          imageUrl: img.imageUrl || [],
          key: article.id,
        })),
        "articles"
      ),
    }));

    return NextResponse.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error("Error fetching IndusTales articles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch IndusTales articles", data: [] },
      { status: 500 }
    );
  }
}
