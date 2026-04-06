import { NextResponse } from "next/server";
import { getAllAuthors } from "@/lib/db-authors";

export async function GET() {
  try {
    const result = await getAllAuthors(1, 100, {
      status: 'Published'
    });

    const publishedAuthors = result.authors
      .filter(author => author.isContent)
      .map(author => ({
        _id: author.id,
        name: author.name,
        aboutTheAnchor: author.aboutTheAnchor || '',
        anchorKey: author.anchorKey || '',
        email: author.email || '',
        contentType: author.contentType || 'anchor',
        images: author.images?.map(img => ({
          imageCategory: img.imageCategory,
          imageCategoryValue: img.imageCategoryValue,
          imageDescription: img.imageDescription,
          imageUrl: img.imageUrl,
          key: img.key,
        })) || [],
        facebookUrl: author.facebookUrl || '',
        linkedinUrl: author.linkedinUrl || '',
        twitterUrl: author.twitterUrl || '',
        instagramUrl: author.instagramUrl || '',
        youtubeUrl: author.youtubeUrl || '',
        websiteUrl: author.websiteUrl || '',
        shows: author.shows || [],
        siteId: author.siteId || '',
        authorUrl: author.authorUrl || '',
        countryName: author.countryName || '',
        createdAt: author.createdAt ? author.createdAt.toISOString() : new Date().toISOString(),
        description: author.description || '',
        status: author.status,
        key: author.order || 0,
        slug: author.slug || '',
        publishedAt: author.publishedAt ? author.publishedAt.toISOString() : null,
        updatedAt: author.updatedAt ? author.updatedAt.toISOString() : new Date().toISOString(),
        isContent: author.isContent,
      }));

    return NextResponse.json({
      success: true,
      data: publishedAuthors,
      total: publishedAuthors.length
    });

  } catch (error) {
    console.error('Error fetching featured authors:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured authors',
        data: []
      },
      { status: 500 }
    );
  }
}