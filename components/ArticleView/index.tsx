import TrendingVideo from '@/components/TrendingVideo';
import { getArticleImageUrl } from '@/lib/utils';
import ImageComponent from '../ImageComponent';
import ArticleDeepDive from './ArticleDeepDive';
import ArticleHead from './ArticleHead';
import AuthorBio from './AuthorBio';
import SocialShare from './SocialShare';
import { anchors } from '@/data/anchor';

type Props = {
  article: Article;
};

export default function ArticleView({ article }: Props) {
  let author: any;

  if (article) {
    const authors = article.author.map((allAuthors) => allAuthors);

    if (authors && authors.length) {
      const author = anchors.find(
        // @ts-ignore
        (anchor) => anchor._id === authors[0].id
      );
    }
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
        <ArticleDeepDive
          htmlContent={article.diveContent ? article.diveContent : ''}
        />
      </section>
      <section className="container mx-auto mb-10 lg:mb-0  px-7 lg:px-0">
        <TrendingVideo />
      </section>
    </>
  );
}
