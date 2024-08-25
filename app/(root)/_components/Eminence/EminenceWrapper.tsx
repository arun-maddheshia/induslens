import ImageComponent from '@/components/ImageComponent';
import Carousel from '@/components/UI/Carousel';
import { contentBlockData } from '@/data/content-block';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';

export const EminenceWrapper = () => {
  const indusEminence = contentBlockData.filter(
    (article) => article.category === 'Indus_Eminence',
  );

  return (
    <Carousel
      slidesPerView={4}
      mdSlidesPerView={3}
      smSlidesPerView={1}
      spaceBetween={20}
      gridRows={1}
      loop={true}
      items={indusEminence.map((author) => (
        <div
          key={author._id}
          className="relative h-full border px-10 py-10 text-center"
        >
          <ImageComponent
            src={getImageUrl(author.images, 'mobileDetailsPageBackground')}
            width={100}
            height={100}
            alt={author.name}
            className="m-auto mb-2 aspect-auto rounded-full"
          />
          <h6 className="mb-2 text-lg font-bold leading-6 text-black">
            {author.name}
          </h6>
          <p className="mb-2 text-sm text-gray-500">{author.slug}</p>
          <span className="inline-block border bg-gray-100 px-3 py-2 text-sm text-gray-500">
            {author.countryName}
          </span>
          <Link
            href={{
              pathname: '/indus-eminence',
              query: { authorName: author.name.replace(' ', '_') },
            }}
            className="absolute bottom-0 left-0 right-0 top-0"
            aria-label={`Read more about ${author.name}`}
          ></Link>
        </div>
      ))}
    />
  );
};
