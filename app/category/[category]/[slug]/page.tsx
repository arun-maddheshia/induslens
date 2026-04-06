import React from 'react';
import ArticleView from '@/components/ArticleView';
import { getArticleBySlug } from '@/lib/db';
import { mapArticleToFrontend } from '@/lib/map-article';
import { mapAuthorToFrontend } from '@/lib/map-author';
import { Metadata } from 'next';
import { getImageUrl } from '@/lib/utils';
import { notFound } from 'next/navigation';

type Props = {
  params: { category: string; slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  const socialImage = article?.images?.length
    ? `${process.env.NEXT_PUBLIC_API_URL}/${getImageUrl(
        article.images.map((img) => ({
          imageCategory: img.imageCategory || '',
          imageCategoryValue: img.imageCategoryValue || '',
          imageDescription: img.imageDescription || '',
          imageUrl: img.imageUrl || [],
          key: article.id,
        })),
        'detailsPageBackground',
      )}`
    : `${process.env.NEXT_PUBLIC_API_URL}/social.png`;

  const canonicalCategory = article?.categoryRef?.slug || params.category;

  return {
    title: article?.metaTitle,
    description: article?.metaDescription,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/category/${canonicalCategory}/${params.slug}`,
    },
    openGraph: {
      title: article?.metaTitle ?? undefined,
      description: article?.metaDescription ?? undefined,
      images: socialImage,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: article?.metaTitle ?? undefined,
      description: article?.metaDescription ?? undefined,
      images: socialImage,
    },
  };
}

export default async function page({ params }: Props) {
  const { category, slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleAuthors: Author[] = article.author
    ? [mapAuthorToFrontend(article.author)]
    : [];

  const categorySlug = article.categoryRef?.slug || category;

  return (
    <ArticleView
      article={mapArticleToFrontend(article, `/category/${categorySlug}`)}
      pageUrl={`${process.env.NEXT_PUBLIC_API_URL}/category/${categorySlug}/${slug}`}
      articleAuthors={articleAuthors}
    />
  );
}
