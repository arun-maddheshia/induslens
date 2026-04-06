'use client';

import { useEffect, useState } from 'react';
import ImageComponent from '@/components/ImageComponent';
import TrendingVideo from '@/components/UI/TrendingVideo';
import Carousel from '@/components/UI/Carousel';
import { videoNews } from '@/data/video-news';
import { cn, getImageUrl, getFirstAuthorName } from '@/lib/utils';
import Link from 'next/link';
import FeaturedContributor from './_components/Contributors';
import FeaturedEminence from './_components/Eminence';
import FeaturedArticles from './_components/FeaturedArticles';
import { PageTitle } from './_components/FeaturedArticles/PageTitle';
import ReadMore from '@/components/UI/ReadMore';
import { OtherArticlesSection } from './_components/OtherArticles';
import styles from './Home.module.scss';

export default function Home() {
  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoriesAndArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await fetch('/api/public-categories');
        const categoriesResult = await categoriesResponse.json();

        if (!categoriesResponse.ok) {
          throw new Error(categoriesResult.error || 'Failed to fetch categories');
        }

        if (!categoriesResult.success) {
          throw new Error(categoriesResult.error || 'Failed to fetch categories');
        }

        const categories = categoriesResult.data;
        setArticleCategories(categories);

        // Fetch articles for each category
        const articlesPromises = categories.map(async (category: ArticleCategory) => {
          try {
            const response = await fetch(`/api/category-articles/${category.id}`);
            const result = await response.json();

            if (result.success) {
              return { categoryId: category.id, articles: result.data };
            }
            return { categoryId: category.id, articles: [] };
          } catch (err) {
            console.error(`Error fetching articles for category ${category.id}:`, err);
            return { categoryId: category.id, articles: [] };
          }
        });

        const articlesResults = await Promise.all(articlesPromises);

        // Build categoryArticles object
        const categoryArticlesMap: Record<string, Article[]> = {};
        articlesResults.forEach(({ categoryId, articles }) => {
          categoryArticlesMap[categoryId] = articles;
        });

        setCategoryArticles(categoryArticlesMap);

      } catch (err) {
        console.error('Error fetching categories and articles:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndArticles();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
        <FeaturedArticles />
        <TrendingVideo />

        <section className="py-0 pb-20">
          <PageTitle href="indus-eminence" title="Indus Eminence" />
          <FeaturedEminence />
        </section>

        <section className="py-0 pb-20">
          <PageTitle title="Our Contributors" href="our-contributors" />
          <FeaturedContributor />
        </section>

        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <OtherArticlesSection />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
        <FeaturedArticles />
        <TrendingVideo />

        <section className="py-0 pb-20">
          <PageTitle href="indus-eminence" title="Indus Eminence" />
          <FeaturedEminence />
        </section>

        <section className="py-0 pb-20">
          <PageTitle title="Our Contributors" href="our-contributors" />
          <FeaturedContributor />
        </section>

        <div className="flex justify-center items-center py-8 text-red-600">
          <span>Error loading categories: {error}</span>
        </div>

        <OtherArticlesSection />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
      <FeaturedArticles />

      <TrendingVideo />

      <section className="py-0 pb-20">
        <PageTitle title="IndusTV" />
        <div className="md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4">
          {videoNews
            .filter((video) => video.category === 'industv')
            .map((video) => (
              <div key={`video_page_${video._id}`} className="mb-5 lg:mb-0">
                <Link
                  href={`/industv/${video.slug}`}
                  className="relative block"
                >
                  <ImageComponent
                    src={getImageUrl(video.images, 'detailsPageBackground')}
                    alt={video.name}
                    width={640}
                    height={427}
                    className="mb-2"
                  />
                  <span className="absolute bottom-1 right-1 inline-block rounded bg-black px-2 text-xs font-bold leading-6 text-white">
                    {video.duration}
                  </span>
                </Link>
                <h6 className="mb-2 text-lg font-bold leading-6 text-black hover:underline">
                  <Link href={`/industv/${video.slug}`}>{video.name}</Link>
                </h6>
              </div>
            ))}
        </div>
      </section>

      <section className="py-0 pb-20">
        <PageTitle href="indus-eminence" title="Indus Eminence" />
        <FeaturedEminence />
      </section>

      <section className="py-0 pb-20">
        <PageTitle title="Our Contributors" href="our-contributors" />
        <FeaturedContributor />
      </section>

      {articleCategories.map((category) => (
        <section
          key={`article_category_${category.id}`}
          className={cn('py-0 pb-7 lg:pb-10', styles.categoryListing)}
        >
          <PageTitle title={category.name} href={`category/${category.slug}`} />

          <ReadMore
            className="mb-5 text-lg"
            text={category.description}
            maxLength={300}
            href={`category/${category.slug}`}
          />
          {(categoryArticles[category.id] || []).filter((article) => article.images.length).length > 0 ? (
            <Carousel
              slidesPerView={4}
              mdSlidesPerView={3}
              gridRows={1}
              loop={true}
              spaceBetween={20}
              items={(categoryArticles[category.id] || [])
                .filter((article) => article.images.length)
                .map((articleItem) => (
                  <div key={articleItem._id} className="py-0 lg:py-4">
                    <Link
                      href={`category/${category.slug}?name=${articleItem.slug}`}
                    >
                      <ImageComponent
                        src={getImageUrl(articleItem.images, 'posterImage')}
                        alt={articleItem.name}
                        width={810}
                        height={540}
                        className="mb-2 aspect-[3/2]"
                      />
                    </Link>
                    <h6 className="mb-2 text-lg font-bold leading-6 text-black">
                      <Link
                        href={`category/${category.slug}?name=${articleItem.slug}`}
                        className="hover:underline"
                      >
                        {articleItem.name}
                      </Link>
                    </h6>
                    <p className="mb-2 text-sm text-gray-500">
                      {getFirstAuthorName(articleItem.author)}
                    </p>
                  </div>
                ))}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No articles found for this category</p>
            </div>
          )}
        </section>
      ))}

      <OtherArticlesSection />
    </div>
  );
}
