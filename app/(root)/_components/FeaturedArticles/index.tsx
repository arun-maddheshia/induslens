import { FeaturedArticleIds } from '@/lib/constant';
import FeaturedArticlesWrapper from './FeaturedArticlesWrapper';
import { articles } from '@/data/articles';

export default async function FeaturedArticles() {
  const sortedArticles = FeaturedArticleIds.map((id) =>
    articles.find((article) => article._id === id)
  ).filter((article) => article !== undefined) as Article[];

  const [leftPosts, mainPost, rightPosts] = [
    sortedArticles.slice(0, 2),
    sortedArticles[2],
    sortedArticles.slice(3, 7),
  ];

  return (
    <FeaturedArticlesWrapper
      leftPosts={leftPosts}
      rightPosts={rightPosts}
      mainPost={mainPost}
    />
  );
}
