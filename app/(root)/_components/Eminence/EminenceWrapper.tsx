import ImageComponent from '@/components/ImageComponent';
import Carousel from '@/components/UI/Carousel';
import { contentBlockData } from '@/data/content-block';
import { getArticleImageUrl } from '@/lib/utils';
import Link from 'next/link';

export const EminenceWrapper = () => {
  const indusEminence = contentBlockData.filter(
    (article) => article.category === 'Indus_Eminence'
  );

  return (
    <Carousel
      slidesPerView={4}
      spaceBetween={20}
      gridRows={1}
      loop={true}
      items={indusEminence.map((author) => (
        <div
          key={author._id}
          className="py-10 h-full text-center px-10 border relative"
        >
          <ImageComponent
            src={getArticleImageUrl(
              author.images,
              'mobileDetailsPageBackground'
            )}
            width={100}
            height={100}
            alt={author.name}
            className="mb-2 rounded-full m-auto aspect-auto"
          />
          <h6 className="text-black mb-2 text-lg leading-6 font-bold">
            {author.name}
          </h6>
          <p className="text-sm mb-2 text-gray-500">{author.slug}</p>
          <span className="bg-gray-100 border inline-block text-sm text-gray-500 px-3 py-2">
            {author.countryName}
          </span>
          <Link
            href={{
              pathname: '/indus-eminence',
              query: { authorName: author.name.replace(' ', '_') },
            }}
            className="absolute top-0 right-0 bottom-0 left-0"
          ></Link>
        </div>
      ))}
    />
  );
};
