import { cn } from '@/lib/utils';
import FeaturedArticleCard from './FeaturedArticleCard';
import React from 'react';

type FeaturedArticlesWrapperProps = {
  leftPosts: Article[];
  mainPost: Article;
  rightPosts: Article[];
};

const FeaturedArticlesWrapper = ({
  leftPosts,
  mainPost,
  rightPosts,
}: FeaturedArticlesWrapperProps) => {
  return (
    <div className="flex md:flex-row flex-col">
      <div className="sm:w-full md:w-1/4 order-0">
        {leftPosts.map((article, index) => (
          <div key={`featured-article-${article._id}`}>
            <FeaturedArticleCard
              article={article}
              width={520}
              height={400}
              type="sm"
            />
            <hr
              className={cn(
                'pt-5 mt-5',
                index !== leftPosts.length - 1 ? '' : 'lg:hidden'
              )}
            />
          </div>
        ))}
      </div>
      <div className="px-0 lg:px-5 mb-4 lg:mb-0 sm:w-full md:w-1/2 order-first md:order-1">
        <FeaturedArticleCard
          article={mainPost}
          width={640}
          height={427}
          type="lg"
        />
      </div>
      <div className="sm:w-full md:w-1/4 order-2">
        {rightPosts.map((article, index) => (
          <div key={`featured-article-${article._id}`}>
            <FeaturedArticleCard
              article={article}
              width={100}
              height={100}
              type="md"
            />
            {index !== rightPosts.length - 1 && <hr className="pt-5 mt-5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedArticlesWrapper;
