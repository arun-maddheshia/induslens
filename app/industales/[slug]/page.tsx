import ArticleView from '@/components/ArticleView';
import { getArticleBySlug } from '@/lib/db';
import { mapArticleToFrontend } from '@/lib/map-article';
import { mapAuthorToFrontend } from '@/lib/map-author';
import { absoluteUrlForOg, hydratePostImages } from '@/lib/image-storage';
import { getImageUrl } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  const hydrated = article?.images?.length
    ? hydratePostImages(
        article.images.map((img) => ({
          imageCategory: img.imageCategory || '',
          imageCategoryValue: img.imageCategoryValue || '',
          imageDescription: img.imageDescription || '',
          imageUrl: img.imageUrl || [],
          key: article.id,
        })),
        'articles'
      )
    : [];
  const ogRaw =
    hydrated.length > 0
      ? getImageUrl(hydrated, 'detailsPageBackground') || getImageUrl(hydrated, 'posterImage')
      : '';
  const socialImage = absoluteUrlForOg(
    ogRaw,
    process.env.NEXT_PUBLIC_API_URL || '',
    '/social.png'
  );

  return {
    title: article?.metaTitle,
    description: article?.metaDescription,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/industales/${params.slug}`,
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

export default async function IndusTalesArticlePage({ params }: Props) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article || article.siteId !== 'industales') {
    notFound();
  }

  const articleAuthors: Author[] = article.author
    ? [mapAuthorToFrontend(article.author)]
    : [];

  return (
    <ArticleView
      article={mapArticleToFrontend(article, '/industales')}
      pageUrl={`${process.env.NEXT_PUBLIC_API_URL}/industales/${slug}`}
      articleAuthors={articleAuthors}
    />
  );
}
