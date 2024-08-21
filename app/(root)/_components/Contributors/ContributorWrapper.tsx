'use client';

import { useState } from 'react';

import Carousel from '@/components/UI/Carousel';
import ContributorCard from '@/components/ContributorCard';
import ContributorCardModal from '@/components/UI/ContributorCardModal';
import Modal from '@/components/UI/Modal';

import { getImageUrl } from '@/lib/utils';

type ContributorWrapperProps = {
  contributorList: Author[];
};

export const ContributorWrapper = ({
  contributorList,
}: ContributorWrapperProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<Author>();

  const openModal = (contributor: Author) => {
    setSelectedContributor(contributor);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Carousel
        slidesPerView={4}
        smSlidesPerView={2}
        gridRows={2}
        loop={false}
        spaceBetween={20}
        navigationVariant="top"
        items={contributorList.map((contributor) => (
          <div
            key={contributor._id}
            className="h-full cursor-pointer"
            onClick={() => openModal(contributor)}
          >
            <ContributorCard
              name={contributor.name}
              imageSrc={getImageUrl(
                contributor.images,
                'mobileDetailsPageBackground',
              )}
              countryName={contributor.countryName}
            />
          </div>
        ))}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedContributor && (
          <ContributorCardModal contributor={selectedContributor} />
        )}
      </Modal>
    </>
  );
};
