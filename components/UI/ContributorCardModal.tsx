import React from 'react';
import ImageComponent from '@/components/ImageComponent';
import { getArticleImageUrl } from '@/lib/utils';
import { TwitterIcon, LinkedinIcon, InstagramIcon } from '../Icons';

type ContributorCardModalProps = {
  contributor: Author;
};

export default function ContributorCardModal({
  contributor,
}: ContributorCardModalProps) {
  return (
    <div className="py-5 px-0 md:px-3">
      <div className="md:flex md:content-center mb-0 lg:mb-5">
        <div>
          <ImageComponent
            src={getArticleImageUrl(
              contributor.images,
              'mobileDetailsPageBackground'
            )}
            width={150}
            height={150}
            alt={contributor.name}
            className="rounded-full mb-5 md:mb-0"
          />
        </div>

        <div className="pl-0 md:pl-10">
          <h6 className="font-bold text-xl">{contributor.name}</h6>
          <ul className="flex px-0 md:px-3 py-5">
            {contributor.twitterUrl && (
              <li className="pr-5">
                <a href={contributor.twitterUrl}>
                  <TwitterIcon width={20} height={20} />
                </a>
              </li>
            )}
            {contributor.linkedinUrl && (
              <li className="pr-5">
                <a href={contributor.linkedinUrl}>
                  <LinkedinIcon width={20} height={20} />
                </a>
              </li>
            )}
            {contributor.instagramUrl && (
              <li>
                <a href={contributor.instagramUrl}>
                  <InstagramIcon width={20} height={20} />
                </a>
              </li>
            )}
          </ul>
          {contributor.countryName && (
            <span className="bg-gray-100 border inline-block text-sm text-gray-500 px-3 py-2 mb-5 lg:mb-0">
              {contributor.countryName}
            </span>
          )}
        </div>
      </div>
      <p>{contributor.aboutTheAnchor}</p>
    </div>
  );
}
