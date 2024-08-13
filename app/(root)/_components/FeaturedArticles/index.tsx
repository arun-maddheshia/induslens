import FeaturedArticlesWrapper from './FeaturedArticlesWrapper';

export async function fetchFeaturedArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home`);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const { data }: { data: Article[] } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

export default async function FeaturedArticles() {
  const data = await fetchFeaturedArticles();

  const [leftPosts, mainPost, rightPosts] = [
    data.slice(0, 2),
    data[2],
    data.slice(3, 7),
  ];

  return (
    <FeaturedArticlesWrapper
      leftPosts={leftPosts}
      rightPosts={rightPosts}
      mainPost={mainPost}
    />
  );
}
