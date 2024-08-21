'use client';
import TrendingVideo from '@/components/UI/TrendingVideo';
import { getArticleImageUrl } from '@/lib/utils';
import ImageComponent from '../ImageComponent';
import ArticleDeepDive from './ArticleDeepDive';
import ArticleHead from './ArticleHead';
import AuthorBio from './AuthorBio';
import SocialShare from './SocialShare';
import { anchors } from '@/data/anchor';
import { useRef } from 'react';

type Props = {
  article: Article;
  pageUrl: string;
};

export default function ArticleView({ article, pageUrl }: Props) {
  const authorBioRef = useRef<HTMLDivElement>(null);
  let author: any;

  if (article) {
    const authors = article.author.map((allAuthors) => allAuthors);

    if (authors && authors.length) {
      author = anchors.find(
        // @ts-ignore
        (anchor) => anchor._id === authors[0].id
      );
    }
  }

  const scrollToAuthorBio = () => {
    authorBioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="mx-auto article-container py-10 lg:py-20 lg:pb-10 px-5 lg:px-0">
        <ArticleHead
          title={article.name}
          excerpt={
            article.category === 'IndusLens_OSINT' ||
            article.category === 'Worldview_India'
              ? ''
              : article.excerpt
          }
          authorName={author?.name}
          onAuthorClick={scrollToAuthorBio}
        />

        <SocialShare
          shareUrl={pageUrl}
          title={article.name}
          publishedDate={article.updatedAt}
        />

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
        <div ref={authorBioRef} className="py-5">
          {author && <AuthorBio author={author} />}
        </div>
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
