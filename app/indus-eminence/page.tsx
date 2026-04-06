import { InstagramIcon, LinkedinIcon, TwitterIcon } from '@/components/Icons';
import ImageComponent from '@/components/ImageComponent';
import ReadMore from '@/components/UI/ReadMore';
import { getPublishedEminence } from '@/lib/db-eminence';

import { getImageUrl } from '@/lib/utils';
import { Metadata } from 'next';

const pageTitle = 'Indus Eminence';
const pageDescription = 'Celebrating Global Achievers of Indian Origin';

type Props = {
  searchParams: { authorName: string };
};

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_API_URL}/indus-eminence`,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: pageTitle,
    description: pageDescription,
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
};

export default async function page({ searchParams }: Props) {
  const { authorName } = searchParams;
  const authors = await getPublishedEminence();

  if (authorName && authors.length) {
    const normalName = authorName.replace('_', ' ');

    authors.sort((a, b) => {
      const aIsAuthor = a.name === normalName;
      const bIsAuthor = b.name === normalName;

      if (aIsAuthor && !bIsAuthor) return -1;
      if (!aIsAuthor && bIsAuthor) return 1;
      return 0;
    });
  }

  return (
    <section className="article-container mx-auto px-4 py-10 md:px-0">
      <h1 className="mb-4 text-center text-4xl font-bold">Indus Eminence</h1>
      <p className="mb-10 text-center text-xl">
        Celebrating Global Achievers of Indian Origin
      </p>
      {authors.map((author: Eminence) => {
        return (
          <div key={author._id} className="mb-7 border p-4 md:p-10">
            <div className="mb-5 md:flex md:items-center">
              <div className="md:basis-[20%]">
                <ImageComponent
                  src={getImageUrl(
                    author.images,
                    'mobileDetailsPageBackground',
                  )}
                  width={120}
                  height={120}
                  alt={author.name}
                  className="mb-5 rounded-full md:mb-0"
                />
              </div>
              <div className="px-0 md:basis-[55%] md:px-5">
                <h5 className="text-2xl font-bold">{author.name}</h5>
                <p className="mb-4 text-sm text-neutral-500">{author.slug}</p>
                <div className="mb-4 flex gap-3 md:mb-0">
                  {author.linkedinUrl && (
                    <a href={author.linkedinUrl}>
                      <LinkedinIcon width={20} height={20} />
                    </a>
                  )}
                  {author.twitterUrl && (
                    <a href={author.twitterUrl}>
                      <TwitterIcon width={20} height={20} />
                    </a>
                  )}
                  {author.instagramUrl && (
                    <a href={author.instagramUrl}>
                      <InstagramIcon width={20} height={20} fill="#000" />
                    </a>
                  )}
                </div>
              </div>
              <div className="text-left md:basis-[25%] md:text-right">
                <span className="inline-block border bg-gray-100 px-3 py-2 text-sm text-gray-500">
                  {author.countryName}
                </span>
              </div>
            </div>
            <div>
              <ReadMore
                className="text-md"
                text={author.excerpt}
                maxLength={300}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
