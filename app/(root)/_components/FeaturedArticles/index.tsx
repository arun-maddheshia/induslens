'use client';

import { useEffect, useState } from 'react';
import FeaturedArticlesWrapper from './FeaturedArticlesWrapper';
import { FeaturedArticlesSkeleton } from '@/components/UI/Skeleton';

type FeaturedArticlesData = {
  leftPosts: Article[];
  mainPost: Article | null;
  rightPosts: Article[];
};

export default function FeaturedArticles() {
  const [data, setData] = useState<FeaturedArticlesData>({
    leftPosts: [],
    mainPost: null,
    rightPosts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/featured-articles');

        if (!response.ok) {
          throw new Error('Failed to fetch featured articles');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching featured articles:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  if (loading) {
    return <FeaturedArticlesSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8 text-red-600">
        <span>Error loading featured articles: {error}</span>
      </div>
    );
  }

  if (!data.mainPost && data.leftPosts.length === 0 && data.rightPosts.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 text-muted-foreground">
        <span>No featured articles found</span>
      </div>
    );
  }

  return (
    <FeaturedArticlesWrapper
      leftPosts={data.leftPosts}
      rightPosts={data.rightPosts}
      mainPost={data.mainPost}
    />
  );
}
