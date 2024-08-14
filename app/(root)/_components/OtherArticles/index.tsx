'use client';
import { getArticleImageUrl, getFirstAuthorName } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { PageTitle } from '../FeaturedArticles/PageTitle';
import ImageComponent from '@/components/ImageComponent';

type OtherArticlesSectionProps = {
  articles: Article[];
};

export const OtherArticlesSection = ({
  articles,
}: OtherArticlesSectionProps) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreArticles = () => {
    const newCount = visibleCount + 12;
    setVisibleCount(newCount);

    // Check if there are more articles to load
    if (
      newCount >=
      articles.filter((article) => article.category === 'none').length
    ) {
      setHasMore(false);
    }
  };

  const visibleArticles = articles
    .filter((article) => article.category === 'none')
    .slice(0, visibleCount);

  return (
    <section className="py-0 pb-20">
      <PageTitle title="Other Stories" />
      <div className="lg:grid lg:grid-cols-2 gap-5">
        {visibleArticles.map((article) => (
          <div
            key={`other_stories_${article._id}`}
            className="border mb-5 lg:mb-0"
          >
            <Link href={`articles/${article.slug}`}>
              <ImageComponent
                src={getArticleImageUrl(
                  article.images,
                  'detailsPageBackground'
                )}
                width={640}
                height={427}
                alt={article.name}
                className="aspect-[11/7] object-cover"
              />
            </Link>
            <div className="p-5">
              <h5 className="text-xl lg:text-3xl font-bold mb-2">
                <Link
                  href={`articles/${article.slug}`}
                  className="hover:underline"
                >
                  {article.name}
                </Link>
              </h5>
              <p className="text-md lg:text-lg mb-3 line-clamp-2">
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
        <div className="text-center pt-5">
          <button
            onClick={loadMoreArticles}
            className="mt-5 px-4 py-2 bg-black text-white rounded hover:bg-blend-darken"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
};
