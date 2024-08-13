import React from 'react';

import ArticleView from '@/components/ArticleView';
import { articles } from '@/data/articles';
import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle(params.slug);

  return {
    title: article?.metaTitle,
    description: article?.metaDescription,
    openGraph: {
      title: article?.metaTitle,
      description: article?.metaDescription,
      images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: article?.metaTitle,
      description: article?.metaDescription,
      images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    },
  };
}

export default async function page({ params }: Props) {
  const { slug } = params;
  const article = getArticle(slug);

  if (!article) {
    return;
  }
  return (
    <ArticleView
      article={article}
      pageUrl={`${process.env.NEXT_PUBLIC_API_URL}/category/${slug}`}
    />
  );
}
