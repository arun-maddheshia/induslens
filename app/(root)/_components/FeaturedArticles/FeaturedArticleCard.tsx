import {
  cn,
  getImageUrl,
  getFirstAuthorName,
  normalizeText,
  slugify,
} from '@/lib/utils';
import Link from 'next/link';
import ImageComponent from '@/components/ImageComponent';

export type FeaturedArticleCardType = 'sm' | 'md' | 'lg';

export interface FeaturedArticleCardConfig {
  imageClassName: string;
  titleClassName: string;
  authorClassName: string;
  containerClassName: string;
}

export const postCardTypeConfig: Record<
  FeaturedArticleCardType,
  FeaturedArticleCardConfig
> = {
  sm: {
    imageClassName: 'aspect-[3/2] mb-2',
    titleClassName: 'text-black mb-2 leading-6 font-semibold text-lg',
    authorClassName: 'text-gray-500 font-semibold uppercase text-xs',
    containerClassName: 'hover:underline',
  },
  md: {
    imageClassName: 'aspect-[1/1] object-cover',
    titleClassName: 'text-black mb-2 leading-6 font-semibold',
    authorClassName: 'text-gray-500 font-semibold uppercase text-xs',
    containerClassName:
      'flex flex-row-reverse hover:underline sm:flex sm:justify-between',
  },
  lg: {
    imageClassName: 'aspect-[3/2] mb-2',
    titleClassName:
      'text-black mb-2 leading-6 font-semibold text-xl lg:text-2xl font-bold p-3',
    authorClassName:
      'text-gray-500 font-semibold uppercase lg:absolute bottom-4 lg:left-4 text-xs lg:text-sm lg:pl-0 pl-3 mb-3 lg:mb-0',
    containerClassName: 'border hover:underline pb-4 lg:pb-0',
  },
};

interface FeaturedArticleCardProps {
  article: Article;
  width: number;
  height: number;
  type?: FeaturedArticleCardType;
}

const FeaturedArticleCard = ({
  article,
  width,
  height,
  type = 'sm',
}: FeaturedArticleCardProps) => {
  const config = postCardTypeConfig[type];

  const authorName = getFirstAuthorName(article.author);

  const redirectUrl = () => {
    if (article.category === 'none') {
      return `/articles/${article.slug}`;
    } else {
      return `/category/${slugify(article.category)}?${slugify(article.slug)}`;
    }
  };

  return (
    <div className={cn('relative min-h-full', config.containerClassName)}>
      <div className={type === 'md' ? 'basis-[30%] sm:text-right' : ''}>
        <Link
          href={redirectUrl()}
          className={type === 'md' ? 'inline-block' : ''}
        >
          <ImageComponent
            src={getImageUrl(article.images, 'posterImage')}
            alt={article.name}
            width={width}
            height={height}
            className={config.imageClassName}
          />
        </Link>
      </div>
      <div className={type === 'md' ? 'basis-[70%] pr-5' : ''}>
        <Link href={redirectUrl()}>
          <h6 className={config.titleClassName}>{article.name}</h6>
          <p className={config.authorClassName}>
            {authorName || normalizeText(article.category)}
          </p>
          {type === 'lg' && article.excerpt && (
            <p className="text-md px-3 text-black lg:text-xl">
              {article.excerpt}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
};

export default FeaturedArticleCard;
