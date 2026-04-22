import ImageComponent from '@/components/ImageComponent';
import ReadMore from '@/components/UI/ReadMore';
import { Share } from '@/components/UI/Share';
import { cn, getImageUrl, getFirstAuthorName } from '@/lib/utils';
import { Metadata } from 'next';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { hydratePostImages } from '@/lib/image-storage';

async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: { slug },
  });
}

async function fetchCategoryArticles(categoryId: string): Promise<Article[]> {
  const articles = await db.article.findMany({
    where: {
      categoryId,
      status: 'PUBLISHED',
      visibility: true,
    },
    orderBy: [{ categoryOrder: 'asc' }, { publishedAt: 'desc' }],
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

  return articles.map((article) => ({
    _id: article.id,
    headline: article.headline || '',
    excerpt: article.excerpt || '',
    articleBody: article.articleBody || '',
    datePublished: article.publishedAt?.toISOString() || '',
    dateCreated: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.author ? [{ id: article.author.id, name: article.author.name || '' }] : [],
    categories: article.categoryRef ? [article.categoryRef.id] : [],
    category: article.categoryRef?.id || '',
    categoryIsNews: article.categoryRef?.isNews ?? false,
    categorySlug: article.categoryRef?.slug || '',
    newsType: 'article',
    agency: 'IndusLens',
    alternativeHeadline: article.alternativeHeadline || '',
    ampValidationMessage: '',
    archivedAt: '',
    contentType: 'article' as any,
    editor: '',
    expires: '',
    genre: [],
    keywords: [],
    language: 'en',
    locationCreated: '',
    mainEntityOfPage: '',
    metaDescription: article.metaDescription || '',
    metaTitle: article.metaTitle || '',
    pageContent: article.pageContent || '',
    publishedAt: article.publishedAt?.toISOString() || '',
    publisher: 'IndusLens',
    siteId: '1',
    sourceType: 'original',
    subCategories: [],
    tags: [],
    url: `/category/${article.categoryRef?.slug}/${article.slug}` || '',
    key: parseInt(article.id.slice(-6), 16),
    isContent: true,
    description: article.alternativeHeadline || '',
    name: article.headline || '',
    slug: article.slug || '',
    status: article.status,
    visibility: article.visibility || true,
    optionalfield: '',
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    images: hydratePostImages(
      (article.images || []).map((img) => ({
        imageCategory: img.imageCategory || 'article',
        imageCategoryValue: img.imageCategoryValue || '',
        imageDescription: img.imageDescription || '',
        imageUrl: img.imageUrl || [],
        key: article.id,
      })),
      'articles'
    ),
  }));
}

type Props = {
  params: { category: string };
  searchParams: { name: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const articleCategory = await getCategoryBySlug(params.category);

  return {
    title: articleCategory?.name,
    description: articleCategory?.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/category/${articleCategory?.slug}`,
    },
    openGraph: {
      title: articleCategory?.name,
      description: articleCategory?.description,
      images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: articleCategory?.name,
      description: articleCategory?.description,
      images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    },
  };
}

export default async function page({ params, searchParams }: Props) {
  const { name } = searchParams;
  const articleCategory = await getCategoryBySlug(params.category);

  if (!articleCategory) {
    notFound();
  }

  // Use isNews field from database instead of hardcoded IDs
  const isSingleGridView = articleCategory.isNews === true;

  const gridColumnClass = isSingleGridView
    ? 'lg:max-w-[60%] mx-auto'
    : 'lg:grid lg:grid-cols-2 gap-5 lg:max-w-[90%] mx-auto';

  // Fetch articles from API instead of using dummy data
  const articleList = await fetchCategoryArticles(articleCategory.id);

  // If there's a specific article name in query params, sort to show it first
  if (name && articleList.length) {
    articleList.sort((a, b) => {
      const aIsArticle = a.slug === name;
      const bIsArticle = b.slug === name;

      if (aIsArticle && !bIsArticle) return -1;
      if (!aIsArticle && bIsArticle) return 1;
      return 0;
    });
  }

  return (
    <section className="container mx-auto my-5 px-5 py-10 lg:px-0">
      <div
        className={cn(
          isSingleGridView
            ? 'mx-auto lg:max-w-[50%]'
            : 'mx-auto lg:max-w-[80%]',
        )}
      >
        <h1 className="mb-4 text-center text-4xl font-bold">
          {articleCategory ? articleCategory.name : ''}
        </h1>
        <p className="text-md mb-10 text-center">
          {articleCategory ? articleCategory.description : ''}
        </p>
      </div>

      {articleList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">No articles found in this category</p>
          <p className="text-gray-500">Check back later for new content!</p>
        </div>
      ) : (
        <div className={gridColumnClass}>
          {articleList.map((article: Article) => (
          <div key={article._id} className="relative mb-5 border">
            <Link
              href={`/category/${articleCategory.slug}/${article.slug}`}
              className="relative mb-2 block aspect-[11/7] w-full overflow-hidden bg-neutral-100"
            >
              <ImageComponent
                src={getImageUrl(article.images, 'detailsPageBackground')}
                alt={article.name}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain object-center"
              />
            </Link>
            <div className="relative p-5">
              <Link href={`/category/${articleCategory.slug}/${article.slug}`}>
                <h6 className="mb-4 text-2xl font-bold leading-8 text-black hover:underline md:text-3xl">
                  {article.name}
                </h6>
              </Link>
              <div className="pr-[40px]">
                  <ReadMore
                    text={article.alternativeHeadline || article.excerpt || ''}
                    maxLength={300}
                    className="mb-4"
                    href={`/category/${articleCategory.slug}/${article.slug}`}
                  />
              </div>
              <p className="text-md mt-2 text-gray-500">
                {getFirstAuthorName(article.author)}
              </p>
            </div>
            <div className="absolute bottom-2 right-4">
              <Share
                shareUrl={`${process.env.NEXT_PUBLIC_API_URL}/category/${articleCategory.slug}/${article.slug}`}
                title={article.name}
              />
            </div>
          </div>
        ))}
        </div>
      )}
    </section>
  );
}
