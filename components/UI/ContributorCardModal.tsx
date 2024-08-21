import React from 'react';
import ImageComponent from '@/components/ImageComponent';
import { getImageUrl } from '@/lib/utils';
import {
  TwitterIcon,
  LinkedinIcon,
  InstagramIcon,
  FacebookIcon,
  WebIcon,
} from '../Icons';
import Link from 'next/link';

type ContributorCardModalProps = {
  contributor: Author;
};

export default function ContributorCardModal({
  contributor,
}: ContributorCardModalProps) {
  return (
    <div className="px-0 py-5 md:px-3">
      <div className="mb-0 md:flex md:content-center lg:mb-5">
        <div>
          <ImageComponent
            src={getImageUrl(contributor.images, 'mobileDetailsPageBackground')}
            width={150}
            height={150}
            alt={contributor.name}
            className="mb-5 rounded-full md:mb-0"
          />
        </div>

        <div className="pl-0 md:pl-10">
          <h6 className="text-xl font-bold">{contributor.name}</h6>
          <ul className="flex px-0 py-5 md:px-3">
            {contributor.facebookUrl && (
              <li className="pr-5">
                <a href={contributor.facebookUrl}>
                  <FacebookIcon width={25} height={25} />
                </a>
              </li>
            )}
            {contributor.twitterUrl && (
              <li className="pr-5">
                <a href={contributor.twitterUrl}>
                  <TwitterIcon width={25} height={25} />
                </a>
              </li>
            )}
            {contributor.linkedinUrl && (
              <li className="pr-5">
                <a href={contributor.linkedinUrl}>
                  <LinkedinIcon width={25} height={25} />
                </a>
              </li>
            )}
            {contributor.instagramUrl && (
              <li className="pr-5">
                <a href={contributor.instagramUrl}>
                  <InstagramIcon width={25} height={25} />
                </a>
              </li>
            )}
            {contributor.websiteUrl && (
              <li>
                <a href={contributor.websiteUrl}>
                  <WebIcon fill="#000" width={25} height={25} />
                </a>
              </li>
            )}
          </ul>
          <div className="mb-5 lg:mb-0">
            {contributor.countryName && (
              <span className="mr-3 inline-block border bg-gray-100 px-3 py-2 text-sm text-gray-500">
                {contributor.countryName}
              </span>
            )}
            {contributor.authorUrl && (
              <Link
                className="inline-block border px-3 py-2 text-sm text-gray-500 transition-all ease-in-out hover:bg-black hover:text-white"
                href={`${contributor.authorUrl}`}
              >
                View Article
              </Link>
            )}
          </div>
        </div>
      </div>
      <p>{contributor.aboutTheAnchor}</p>
    </div>
  );
}
