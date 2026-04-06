import ArticleView from '@/components/ArticleView';
import { getArticleBySlug } from '@/lib/db';
import { mapArticleToFrontend } from '@/lib/map-article';
import { mapAuthorToFrontend } from '@/lib/map-author';
import { getImageUrl } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
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

  return {
    title: article?.metaTitle,
    description: article?.metaDescription,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/articles/${params.slug}`,
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
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleAuthors: Author[] = article.author
    ? [mapAuthorToFrontend(article.author)]
    : [];

  return (
    <ArticleView
      article={mapArticleToFrontend(article, '/articles')}
      pageUrl={`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`}
      articleAuthors={articleAuthors}
    />
  );
}
