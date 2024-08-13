import { InstagramIcon, LinkedinIcon, TwitterIcon } from '@/components/Icons';
import ImageComponent from '@/components/ImageComponent';

import { getArticleImageUrl } from '@/lib/utils';
import { fetchEminence } from './action';

export interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

export default async function page({ searchParams }: SearchParamsProps) {
  const limit = 10;
  const currentPage = 1;

  const response = await fetchEminence(
    currentPage,
    limit,
    'Indus_Eminence',
    searchParams['authorName']
  );
  const authors = response.data;

  return (
    <section className="article-container py-10 mx-auto">
      <h1 className="font-bold text-4xl text-center mb-4">Indus Eminence</h1>
      <p className="text-xl text-center mb-10">
        Celebrating Global Achievers of Indian Origin
      </p>
      {authors.map((author: Eminence) => {
        return (
          <div key={author._id} className="border p-10 mb-7">
            <div className="flex items-center mb-5">
              <div className="basis-[20%]">
                <ImageComponent
                  src={getArticleImageUrl(
                    author.images,
                    'mobileDetailsPageBackground'
                  )}
                  width={120}
                  height={120}
                  alt={author.name}
                  className="rounded-full"
                />
              </div>
              <div className="px-5 basis-[55%]">
                <h5 className="font-bold text-2xl">{author.name}</h5>
                <p className="text-neutral-500 text-sm mb-4">{author.slug}</p>
                <div className="flex gap-3">
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
              <div className="basis-[25%] text-right">
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
