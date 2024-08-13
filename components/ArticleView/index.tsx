import TrendingVideo from '@/components/TrendingVideo';
import { getArticleImageUrl } from '@/lib/utils';
import ImageComponent from '../ImageComponent';
import ArticleDeepDive from './ArticleDeepDive';
import ArticleHead from './ArticleHead';
import AuthorBio from './AuthorBio';
import SocialShare from './SocialShare';

type Props = {
  params: { slug: string };
};

export async function fetchArticle(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/article/${slug}`
  );
  const responseJson = await res.json();
  return responseJson['data'];
}

export default async function ArticleView({ params }: Props) {
  const { slug } = params;

  const { article, author } = await fetchArticle(slug);

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <>
      <section className="mx-auto article-container py-20 px-5 lg:px-0">
        <ArticleHead
          title={article.name}
          excerpt={article.excerpt}
          authorName={author?.name}
        />
        <SocialShare />

        <ImageComponent
          src={getArticleImageUrl(article.images, 'posterImage')}
          alt={article.headline}
          width={813}
          height={546}
        />
        <div
          className="text-lg font-medium"
          dangerouslySetInnerHTML={{ __html: article.pageContent || '' }}
        />
        {author && <AuthorBio author={author} />}
        <ArticleDeepDive htmlContent={article.diveContent} />
      </section>
      <section className="container mx-auto mb-10 lg:mb-0  px-7 lg:px-0">
        <TrendingVideo />
      </section>
    </>
  );
}
