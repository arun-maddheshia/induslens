'use client';

import { useEffect, useState } from 'react';
import FeaturedArticlesWrapper from '@/app/(root)/_components/FeaturedArticles/FeaturedArticlesWrapper';
import { FeaturedArticlesSkeleton, CategorySectionSkeleton } from '@/components/UI/Skeleton';
import { OtherArticlesSection } from '@/app/(root)/_components/OtherArticles';
import { PageTitle } from '@/app/(root)/_components/FeaturedArticles/PageTitle';
import Carousel from '@/components/UI/Carousel';
import ImageComponent from '@/components/ImageComponent';
import ReadMore from '@/components/UI/ReadMore';
import { getImageUrl, getFirstAuthorName, cn } from '@/lib/utils';
import Link from 'next/link';
import styles from '@/app/(root)/Home.module.scss';

type FeaturedData = {
  leftPosts: Article[];
  mainPost: Article | null;
  rightPosts: Article[];
};

function IndusTalesPageSkeleton() {
  return (
    <>
      <FeaturedArticlesSkeleton />
      {Array.from({ length: 3 }).map((_, i) => (
        <CategorySectionSkeleton key={i} />
      ))}
    </>
  );
}

export default function IndusTalesPage() {
  const [featured, setFeatured] = useState<FeaturedData>({
    leftPosts: [],
    mainPost: null,
    rightPosts: [],
  });
  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [featuredData, categoriesResult] = await Promise.all([
        fetch('/api/industales-featured').then((r) => r.json()).catch(() => null),
        fetch('/api/public-categories?siteId=industales').then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      if (featuredData) setFeatured(featuredData);

      const categories: ArticleCategory[] = categoriesResult.success ? categoriesResult.data : [];
      setArticleCategories(categories);

      const articlesResults = await Promise.all(
        categories.map((cat) =>
          fetch(`/api/category-articles/${cat.id}?siteId=industales`)
            .then((r) => r.json())
            .then((res) => ({ categoryId: cat.id, articles: res.success ? res.data : [] }))
            .catch(() => ({ categoryId: cat.id, articles: [] }))
        )
      );

      const map: Record<string, Article[]> = {};
      articlesResults.forEach(({ categoryId, articles }) => { map[categoryId] = articles; });
      setCategoryArticles(map);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
      {loading ? (
        <IndusTalesPageSkeleton />
      ) : (
        <>
          {/* Hero playlist section */}
          {(featured.mainPost || featured.leftPosts.length > 0 || featured.rightPosts.length > 0) && (
            <FeaturedArticlesWrapper
              leftPosts={featured.leftPosts}
              mainPost={featured.mainPost}
              rightPosts={featured.rightPosts}
            />
          )}

          {/* Dynamic category carousels ordered by admin */}
          {articleCategories.map((category) => (
            <section
              key={category.id}
              className={cn('py-0 pb-7 lg:pb-10', styles.categoryListing)}
            >
              <PageTitle title={category.name} href={`category/${category.slug}`} />
              <ReadMore
                className="mb-5 text-lg"
                text={category.description}
                maxLength={300}
                href={`category/${category.slug}`}
              />
              {(categoryArticles[category.id] || []).filter((a) => a.images.length).length > 0 ? (
                <Carousel
                  slidesPerView={4}
                  mdSlidesPerView={3}
                  gridRows={1}
                  loop={true}
                  spaceBetween={20}
                  items={(categoryArticles[category.id] || [])
                    .filter((a) => a.images.length)
                    .map((article) => (
                      <div key={article._id} className="py-0 lg:py-4">
                        <Link href={`category/${category.slug}?name=${article.slug}`}>
                          <ImageComponent
                            src={getImageUrl(article.images, 'posterImage')}
                            alt={article.name}
                            width={810}
                            height={540}
                            className="mb-2 aspect-[3/2]"
                          />
                        </Link>
                        <h6 className="mb-2 text-lg font-bold leading-6 text-black">
                          <Link
                            href={`category/${category.slug}?name=${article.slug}`}
                            className="hover:underline"
                          >
                            {article.name}
                          </Link>
                        </h6>
                        <p className="mb-2 text-sm text-gray-500">
                          {getFirstAuthorName(article.author)}
                        </p>
                      </div>
                    ))}
                />
              ) : (
                <div className="py-8 text-center text-sm text-gray-400">
                  No articles found for this category.
                </div>
              )}
            </section>
          ))}
        </>
      )}

      {/* Other Stories */}
      <OtherArticlesSection apiEndpoint="/api/industales-other-stories" />
    </div>
  );
}
