'use client';

import { getContributors } from '@/actions/getContributors';
import ContributorCard from '@/components/ContributorCard';
import { getArticleImageUrl } from '@/lib/utils';
import { useState } from 'react';

type ContributorsListProps = {
  initialContributors: Author[];
};

const NUMBER_OF_USERS_TO_FETCH = 10;

export default function ContributorsList({
  initialContributors,
}: ContributorsListProps) {
  const [offset, setOffset] = useState(NUMBER_OF_USERS_TO_FETCH);
  const [contributors, setContributors] =
    useState<Author[]>(initialContributors);
  const [showLoadMore, setShowLoadMore] = useState<boolean>(true);

  const loadMoreUsers = async () => {
    const apiContributors = await getContributors(
      offset,
      NUMBER_OF_USERS_TO_FETCH
    );

    setContributors([...contributors, ...apiContributors.data]);
    setOffset(offset + NUMBER_OF_USERS_TO_FETCH);
    setShowLoadMore(apiContributors.totalItems > contributors.length);
  };

  

  return (
    <>
      <div className="grid grid-cols-4 gap-5">
        {contributors.map((contributor) => {
          return (
            <div key={contributor._id} className="h-full mb-5">
              <ContributorCard
                name={contributor.name}
                imageSrc={getArticleImageUrl(
                  contributor.images,
                  'mobileDetailsPageBackground'
                )}
                countryName={contributor.countryName}
              />
            </div>
          );
        })}
      </div>
      {showLoadMore && <button onClick={loadMoreUsers}>Load more</button>}
    </>
  );
}
