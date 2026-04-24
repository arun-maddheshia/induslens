export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hydratePostImages } from "@/lib/image-storage";

export async function GET() {
  try {
    if (!db) {
      throw new Error("Database connection not available");
    }

    const playlist = await db.indusTalesOtherStoriesPlaylist.findMany({
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                images: {
                  select: {
                    imageCategory: true,
                    imageCategoryValue: true,
                    imageDescription: true,
                    imageUrl: true,
                  },
                  take: 1,
                },
              },
            },
            images: {
              select: {
                imageCategory: true,
                imageCategoryValue: true,
                imageDescription: true,
                imageUrl: true,
              },
            },
            categoryRef: {
              select: { id: true, name: true, slug: true, isNews: true },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const data = playlist
      .filter((item) => item.article !== null && item.article.status === "PUBLISHED")
      .map((item) => {
        const article = item.article!;
        return {
          _id: article.id,
          headline: article.headline || "",
          excerpt: article.excerpt || "",
          articleBody: article.articleBody || "",
          datePublished: article.publishedAt?.toISOString() || "",
          dateCreated: article.createdAt.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
          publishedAt: article.publishedAt?.toISOString() || "",
          author: article.author ? [{ id: article.author.id, name: article.author.name || "" }] : [],
          categories: article.categoryRef ? [article.categoryRef.id] : [],
          category: article.categoryRef?.name || "none",
          categoryIsNews: article.categoryRef?.isNews ?? false,
          categorySlug: article.categoryRef?.slug || "",
          newsType: "article",
          agency: "IndusTales",
          alternativeHeadline: article.alternativeHeadline || "",
          ampValidationMessage: "",
          archivedAt: "",
          contentType: "articles" as ContentType,
          editor: "",
          expires: "",
          genre: [],
          keywords: [],
          language: "en",
          locationCreated: "",
          mainEntityOfPage: "",
          metaDescription: article.metaDescription || "",
          metaTitle: article.metaTitle || "",
          pageContent: article.pageContent || "",
          publisher: "IndusTales",
          siteId: article.siteId || "industales",
          sourceType: "original",
          subCategories: [],
          tags: [],
          url: `/industales/${article.slug || article.id}`,
          key: parseInt(article.id.slice(-6), 16),
          isContent: true,
          description: article.alternativeHeadline || "",
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
        };
      });

    return NextResponse.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error("Error fetching IndusTales other stories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch IndusTales other stories", data: [] },
      { status: 500 }
    );
  }
}
