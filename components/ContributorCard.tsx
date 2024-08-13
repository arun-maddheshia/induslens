import React from 'react';
import ImageComponent from './ImageComponent';
import { cn } from '@/lib/utils';

type ContributorCardProps = {
  name: string;
  imageSrc: string;
  countryName?: string;
  className?: string;
};

export default function ContributorCard({
  name,
  countryName,
  imageSrc,
  className,
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

        <div className="p-5 h-[140px]">
          <h6 className="text-black mb-2 text-lg leading-6 font-bold">
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
