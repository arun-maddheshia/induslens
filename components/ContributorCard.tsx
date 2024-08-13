import React from 'react';
import ImageComponent from './ImageComponent';
import { cn } from '@/lib/utils';

type ContributorCardProps = {
  name: string;
  imageSrc: string;
  countryName?: string;
  className?: string;
  singleView?: boolean;
};

export default function ContributorCard({
  name,
  countryName,
  imageSrc,
  className,
  singleView,
}: ContributorCardProps) {
  return (
    <>
      <div className={cn('border h-full', className)}>
        <ImageComponent
          src={imageSrc}
          alt={name}
          width={500}
          height={500}
          className="aspect-square"
        />

        <div className={cn('p-3 lg:p-5 ', !singleView ? 'h-[140px]' : '')}>
          <h6
            className={cn(
              'text-black mb-2 font-bold',
              !singleView
                ? 'text-md lg:text-lg leading-5 lg:leading-6'
                : 'text-lg leading-6'
            )}
          >
            {name}
          </h6>
          {countryName && (
            <span className="bg-gray-100 border inline-block text-sm text-gray-500 px-3 py-2">
              {countryName}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
