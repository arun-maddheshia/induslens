// components/AuthorBio.tsx
import React from 'react';
import Image from 'next/image';
import { TwitterIcon } from '@/components/Icons';

type AuthorBioProps = {
  author: {
    name: string;
    images: { imageUrl: string[] }[];
    twitterUrl: string;
    aboutTheAnchor: string;
  };
};

const AuthorBio: React.FC<AuthorBioProps> = ({ author }) => (
  <div className="border p-5 mb-5">
    <div className="md:flex md:flex-row">
      <div className="md:basis-[20%]">
        <Image
          src={author.images[0].imageUrl[0]}
          width={100}
          height={100}
          alt={author.name}
          className="rounded-full mb-5 lg:mb-0"
        />
      </div>
      <div className="md:basis-[80%]">
        <h5 className="mb-2 font-bold text-lg">{author.name}</h5>
        <a className="mb-2 inline-block" href={author.twitterUrl}>
          <TwitterIcon width={20} height={20} />
        </a>
        <div className="whitespace-pre-wrap leading-6 md:leading-8 text-gray-500 font-normal md:font-semibold text-sm md:text-md pb-5">
          {author.aboutTheAnchor}
        </div>
      </div>
    </div>
  </div>
);

export default AuthorBio;
