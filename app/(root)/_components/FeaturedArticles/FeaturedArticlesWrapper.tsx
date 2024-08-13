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
      <div className="sm:w-full md:w-1/4">
        {leftPosts.map((article, index) => (
          <div key={`featured-article-${article._id}`}>
            <FeaturedArticleCard
              article={article}
              width={520}
              height={400}
              type="sm"
            />
            {index !== leftPosts.length - 1 && <hr className="pt-5 mt-5" />}
          </div>
        ))}
      </div>
      <div className="px-0 lg:px-5 my-4 lg:my-0 sm:w-full md:w-1/2">
        <FeaturedArticleCard
          article={mainPost}
          width={640}
          height={427}
          type="lg"
        />
      </div>
      <div className="sm:w-full md:w-1/4">
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
