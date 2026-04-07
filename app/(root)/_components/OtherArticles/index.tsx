'use client';
import { getImageUrl, getFirstAuthorName } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PageTitle } from '../FeaturedArticles/PageTitle';
import ImageComponent from '@/components/ImageComponent';
import { OtherArticlesSkeleton } from '@/components/UI/Skeleton';

type OtherArticlesSectionProps = {
  articles?: Article[]; // Make it optional for backward compatibility
};

export const OtherArticlesSection = ({
  articles: propArticles = [],
}: OtherArticlesSectionProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchOtherStories = async () => {
      console.log('🔄 Starting to fetch other stories...');
      try {
        setLoading(true);
        setError(null);

        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('/api/other-stories', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        console.log('📡 API response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to fetch other stories');
        }

        const result = await response.json();
        console.log('📊 API result:', { success: result.success, dataLength: result.data?.length });

        if (result.success) {
          setArticles(result.data);
          console.log('✅ Articles set, length:', result.data.length);
          // Set hasMore based on initial data
          setHasMore(result.data.length > 12);
        } else {
          throw new Error(result.error || 'Failed to fetch other stories');
        }
      } catch (err) {
        console.error('❌ Error fetching other stories:', err);
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        }
        // Fallback to prop articles if available
        if (propArticles.length > 0) {
          setArticles(propArticles.filter((article) => article.category === 'none'));
        }
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    // Add a small delay to avoid rapid re-renders
    const timer = setTimeout(fetchOtherStories, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadMoreArticles = () => {
    const newCount = visibleCount + 12;
    setVisibleCount(newCount);

    // Check if there are more articles to load
    if (newCount >= articles.length) {
      setHasMore(false);
    }
  };

  const visibleArticles = articles.slice(0, visibleCount);

  if (loading) {
    return (
      <section className="py-0 pb-20">
        <PageTitle title="Other Stories" />
        <OtherArticlesSkeleton />
      </section>
    );
  }

  console.log('🎯 Render state:', { loading, error, articlesLength: articles.length });

  if (error && articles.length === 0) {
    return (
      <section className="py-0 pb-20">
        <PageTitle title="Other Stories" />
        <div className="flex justify-center items-center py-8 text-red-600">
          <span>Error loading stories: {error}</span>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="py-0 pb-20">
        <PageTitle title="Other Stories" />
        <div className="flex justify-center items-center py-8 text-muted-foreground">
          <span>No other stories found</span>
        </div>
      </section>
    );
  }

  return (
    <section className="py-0 pb-20">
      <PageTitle title="Other Stories" />
      <div className="gap-5 md:grid md:grid-cols-2">
        {visibleArticles.map((article) => (
          <div
            key={`other_stories_${article._id}`}
            className="mb-5 border lg:mb-0"
          >
            <Link href={`articles/${article.slug}`}>
              <ImageComponent
                src={getImageUrl(article.images, 'detailsPageBackground')}
                width={640}
                height={427}
                alt={article.name}
                className="w-full aspect-[11/7] object-cover"
              />
            </Link>
            <div className="p-5">
              <h5 className="mb-2 text-xl font-bold lg:text-3xl">
                <Link
                  href={`articles/${article.slug}`}
                  className="hover:underline"
                >
                  {article.name}
                </Link>
              </h5>
              <p className="text-md mb-3 line-clamp-2 lg:text-lg">
                <Link
                  href={`articles/${article.slug}`}
                  className="hover:underline"
                >
                  {article.excerpt}
                </Link>
              </p>
              <p className="text-gray-500">
                {getFirstAuthorName(article.author)}
              </p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="pt-5 text-center">
          <button
            onClick={loadMoreArticles}
            className="mt-5 rounded bg-black px-4 py-2 text-white hover:bg-blend-darken"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
};
