'use client';
import { useState } from 'react';

import ContributorCard from '@/components/ContributorCard';
import { getArticleImageUrl } from '@/lib/utils';
import ContributorCardModal from '@/components/UI/ContributorCardModal';
import Modal from '@/components/UI/Modal';

type ContributorsListProps = {
  initialContributors: Author[];
};

export default function ContributorsList({
  initialContributors,
}: ContributorsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<Author>();

  const openModal = (contributor: Author) => {
    setSelectedContributor(contributor);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  return (
    <>
      <div className="grid grid-cols-1  md:grid-cols-3  lg:grid-cols-4 gap-3 md:gap-5">
        {initialContributors.map((contributor) => {
          return (
            <div
              key={contributor._id}
              className="h-full mb-5 cursor-pointer"
              onClick={() => openModal(contributor)}
            >
              <ContributorCard
                name={contributor.name}
                imageSrc={getArticleImageUrl(
                  contributor.images,
                  'mobileDetailsPageBackground'
                )}
                countryName={contributor.countryName}
                singleView
              />
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedContributor && (
          <ContributorCardModal contributor={selectedContributor} />
        )}
      </Modal>
    </>
  );
}
