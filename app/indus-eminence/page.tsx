import { InstagramIcon, LinkedinIcon, TwitterIcon } from '@/components/Icons';
import ImageComponent from '@/components/ImageComponent';
import { contentBlockData } from '@/data/content-block';

import { getArticleImageUrl } from '@/lib/utils';
import { Metadata } from 'next';

const pageTitle = 'Indus Eminence';
const pageDescription = 'Celebrating Global Achievers of Indian Origin';

type Props = {
  searchParams: { authorName: string };
};

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
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
  const authors = contentBlockData.filter(
    (article) => article.category === 'Indus_Eminence'
  );

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
    <section className="article-container px-4 md:px-0 py-10 mx-auto">
      <h1 className="font-bold text-4xl text-center mb-4">Indus Eminence</h1>
      <p className="text-xl text-center mb-10">
        Celebrating Global Achievers of Indian Origin
      </p>
      {authors.map((author: Eminence) => {
        return (
          <div key={author._id} className="border p-4 md:p-10 mb-7">
            <div className="md:flex md:items-center mb-5">
              <div className="md:basis-[20%]">
                <ImageComponent
                  src={getArticleImageUrl(
                    author.images,
                    'mobileDetailsPageBackground'
                  )}
                  width={120}
                  height={120}
                  alt={author.name}
                  className="rounded-full mb-5 md:mb-0"
                />
              </div>
              <div className="px-0 md:px-5 md:basis-[55%]">
                <h5 className="font-bold text-2xl">{author.name}</h5>
                <p className="text-neutral-500 text-sm mb-4">{author.slug}</p>
                <div className="flex gap-3 mb-4 md:mb-0">
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
              <div className="md:basis-[25%] text-left md:text-right">
                <span className="bg-gray-100 border inline-block text-sm text-gray-500 px-3 py-2">
                  {author.countryName}
                </span>
              </div>
            </div>
            <div>
              <p className="text-md line-clamp-3">{author.excerpt}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
