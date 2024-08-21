// components/AuthorBio.tsx
import React from 'react';
import Image from 'next/image';
import { TwitterIcon } from '@/components/Icons';

type AuthorBioProps = {
  author: Author;
};

const AuthorBio: React.FC<AuthorBioProps> = ({ author }) => (
  <div className="mb-5 border p-5">
    <div className="md:flex md:flex-row">
      <div className="md:basis-[20%]">
        <Image
          src={author.images[0].imageUrl[0]}
          width={100}
          height={100}
          alt={author.name}
          className="mb-5 rounded-full lg:mb-0"
        />
      </div>
      <div className="md:basis-[80%]">
        <h5 className="mb-2 text-lg font-bold">{author.name}</h5>
        <a className="mb-2 inline-block" href={author.twitterUrl}>
          <TwitterIcon width={20} height={20} />
        </a>
        <div className="md:text-md whitespace-pre-wrap pb-5 text-sm font-normal leading-6 text-gray-500 md:font-semibold md:leading-8">
          {author.aboutTheAnchor}
        </div>
      </div>
    </div>
  </div>
);

export default AuthorBio;
