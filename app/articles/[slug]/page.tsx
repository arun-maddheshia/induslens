import ArticleView from '@/components/ArticleView';
import { articles } from '@/data/articles';
import { getArticleImageUrl } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
};

function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle(params.slug);

  const socialImage =
    article && article.images
      ? `${process.env.NEXT_PUBLIC_API_URL}/${getArticleImageUrl(
          article?.images,
          'detailsPageBackground'
        )}`
      : `${process.env.NEXT_PUBLIC_API_URL}/social.png`;

  return {
    title: article?.metaTitle,
    description: article?.metaDescription,
    openGraph: {
      title: article?.metaTitle,
      description: article?.metaDescription,
      images: socialImage,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: article?.metaTitle,
      description: article?.metaDescription,
      images: socialImage,
    },
  };
}

export default function page({ params }: Props) {
  const { slug } = params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <ArticleView
      article={article}
      pageUrl={`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`}
    />
  );
}
