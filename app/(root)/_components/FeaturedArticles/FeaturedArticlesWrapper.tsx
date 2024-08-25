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
    <div className="flex flex-col md:flex-row">
      <div className="order-0 md:w-full lg:w-1/4">
        {leftPosts.map((article, index) => (
          <div key={`featured-article-${article._id}`}>
            <FeaturedArticleCard
              article={article}
              width={720}
              height={200}
              type="sm"
            />
            <hr
              className={cn(
                'mt-5 pt-5',
                index !== leftPosts.length - 1 ? '' : 'lg:hidden',
              )}
            />
          </div>
        ))}
      </div>
      <div className="order-first mb-4 px-0 md:order-1 md:w-full md:px-5 lg:mb-0 lg:w-1/2 lg:px-5">
        <FeaturedArticleCard
          article={mainPost}
          width={740}
          height={527}
          type="lg"
        />
      </div>
      <div className="order-2 md:block md:w-full lg:w-1/4">
        {rightPosts.map((article, index) => (
          <div key={`featured-article-${article._id}`}>
            <FeaturedArticleCard
              article={article}
              width={100}
              height={100}
              type="md"
            />
            {index !== rightPosts.length - 1 && <hr className="mt-5 pt-5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedArticlesWrapper;
