import ImageComponent from '@/components/ImageComponent';
import ReadMore from '@/components/UI/ReadMore';
import { Share } from '@/components/UI/Share';
import { db } from '@/lib/db';
import { hydratePostImages } from '@/lib/image-storage';
import { getImageUrl, getFirstAuthorName } from '@/lib/utils';
import Link from 'next/link';

async function fetchCategoryData(categoryId: string) {
  const [category, articles] = await Promise.all([
    db.category.findUnique({ where: { id: categoryId } }),
    db.article.findMany({
      where: { categoryId, status: 'PUBLISHED', visibility: true },
      orderBy: [{ categoryOrder: 'asc' }, { publishedAt: 'desc' }],
      include: {
        author: { select: { id: true, name: true } },
        images: {
          select: {
            imageCategory: true,
            imageCategoryValue: true,
            imageDescription: true,
            imageUrl: true,
          },
        },
        categoryRef: { select: { id: true, slug: true, isNews: true } },
      },
    }),
  ]);

  return { category, articles };
}

interface Props {
  categoryId: string;
  categorySlug: string;
}

export default async function IntelligenceArticleList({ categoryId, categorySlug }: Props) {
  const { category, articles } = await fetchCategoryData(categoryId);

  return (
    <>
      {/* Category heading */}
      {category && (
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
          {category.description && (
            <p className="text-gray-500">{category.description}</p>
          )}
        </div>
      )}

      {/* Articles */}
      {articles.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No articles found.</p>
      ) : (
        <div className="flex flex-col gap-6 lg:max-w-[80%] mx-auto">
          {articles.map((article) => {
            const images = hydratePostImages(
              (article.images || []).map((img) => ({
                imageCategory: img.imageCategory || '',
                imageCategoryValue: img.imageCategoryValue || '',
                imageDescription: img.imageDescription || '',
                imageUrl: img.imageUrl || [],
                key: article.id,
              })),
              'articles'
            );
            const articleUrl = `/category/${categorySlug}/${article.slug}`;

            return (
              <div key={article.id} className="relative border">
                <Link
                  href={articleUrl}
                  className="relative mb-2 block aspect-[11/7] w-full overflow-hidden bg-neutral-100"
                >
                  <ImageComponent
                    src={getImageUrl(images, 'detailsPageBackground')}
                    alt={article.headline}
                    fill
                    sizes="100vw"
                    className="object-contain object-center"
                  />
                </Link>
                <div className="relative p-5">
                  <Link href={articleUrl}>
                    <h2 className="mb-4 text-2xl font-bold leading-8 text-black hover:underline md:text-3xl">
                      {article.headline}
                    </h2>
                  </Link>
                  <div className="pr-[40px]">
                    <ReadMore
                      text={article.alternativeHeadline || article.excerpt || ''}
                      maxLength={300}
                      className="mb-4"
                      href={articleUrl}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {article.author ? article.author.name : ''}
                  </p>
                </div>
                <div className="absolute bottom-2 right-4">
                  <Share
                    shareUrl={`${process.env.NEXT_PUBLIC_API_URL}${articleUrl}`}
                    title={article.headline}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
