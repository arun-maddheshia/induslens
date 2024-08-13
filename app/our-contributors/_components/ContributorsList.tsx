import ContributorCard from '@/components/ContributorCard';
import { getArticleImageUrl } from '@/lib/utils';

type ContributorsListProps = {
  initialContributors: Author[];
};

export default function ContributorsList({
  initialContributors,
}: ContributorsListProps) {
  return (
    <>
      <div className="grid grid-cols-4 gap-5">
        {initialContributors.map((contributor) => {
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
    </>
  );
}
