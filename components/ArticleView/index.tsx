'use client';
import TrendingVideo from '@/components/UI/TrendingVideo';
import { getImageUrl } from '@/lib/utils';
import ImageComponent from '../ImageComponent';
import ArticleDeepDive from './ArticleDeepDive';
import AuthorBio from './AuthorBio';
import SocialShare from './SocialShare';
import { anchors } from '@/data/anchor';
import { useMemo, useRef } from 'react';

type Props = {
  article: Article;
  pageUrl: string;
  articleAuthors?: Author[];
};

export default function ArticleView({ article, pageUrl, articleAuthors }: Props) {
  const authorBioRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentArticleAuthors = useMemo(() => {
    if (articleAuthors && articleAuthors.length > 0) {
      return articleAuthors;
    }
    return article?.author
      .map((articleAuthor) =>
        anchors.find((author) => articleAuthor.id === author._id),
      )
      .filter(Boolean) as Author[];
  }, [article?.author, articleAuthors]);

  const scrollToAuthorBio = (authorId: string) => {
    const authorRef = authorBioRefs.current[authorId];
    if (authorRef) {
      authorRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="article-container mx-auto px-5 py-10 lg:px-0 lg:py-20 lg:pb-10">
        <h1 className="mb-2 text-4xl font-bold">{article.name}</h1>
        <p className="pb-7 text-xl">
          {article.category === 'IndusLens_OSINT' ||
          article.category === 'Worldview_India'
            ? ''
            : article.alternativeHeadline}
        </p>

        {currentArticleAuthors.length > 0 && (
          <div className="pb-7">
            {currentArticleAuthors.map((currentAuthor, index) => (
              <button
                key={currentAuthor._id}
                onClick={() => scrollToAuthorBio(currentAuthor._id)}
                className="text-md font-bold hover:underline"
              >
                {index > 0 && <>&nbsp;&amp;&nbsp;</>}
                {currentAuthor.name}
              </button>
            ))}
          </div>
        )}

        <SocialShare
          shareUrl={pageUrl}
          title={article.name}
          publishedDate={article.updatedAt}
        />

        <ImageComponent
          src={getImageUrl(article.images, 'posterImage')}
          alt={article.headline}
          width={813}
          height={546}
        />
        <div
          className="mb-5 text-lg font-medium"
          dangerouslySetInnerHTML={{ __html: article.pageContent || article.articleBody || '' }}
        />

        {currentArticleAuthors.map((currentAuthor) => (
          <div
            key={currentAuthor._id}
            ref={(el) => {
              authorBioRefs.current[currentAuthor._id] = el;
            }}
          >
            <AuthorBio key={currentAuthor._id} author={currentAuthor} />
          </div>
        ))}

        <ArticleDeepDive
          htmlContent={article.diveContent ? article.diveContent : ''}
        />
      </section>
      <section className="container mx-auto mb-10 px-7 lg:mb-0 lg:px-0">
        <TrendingVideo />
      </section>
    </>
  );
}
