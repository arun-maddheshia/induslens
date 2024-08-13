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
    <div className="flex flex-row">
      <div className="basis-[20%]">
        <Image
          src={author.images[0].imageUrl[0]}
          width={100}
          height={100}
          alt={author.name}
          className="rounded-full"
        />
      </div>
      <div className="basis-[80%]">
        <h5 className="mb-2 font-bold text-lg">{author.name}</h5>
        <a className="mb-2 inline-block" href={author.twitterUrl}>
          <TwitterIcon width={20} height={20} />
        </a>
        <div className="whitespace-pre-wrap leading-8 text-zinc-500 font-semibold text-md pb-5">
          {author.aboutTheAnchor}
        </div>
      </div>
    </div>
  </div>
);

export default AuthorBio;
