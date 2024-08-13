'use client';
import ContributorCard from '@/components/ContributorCard';
import { InstagramIcon, LinkedinIcon, TwitterIcon } from '@/components/Icons';
import ImageComponent from '@/components/ImageComponent';
import Carousel from '@/components/UI/Carousel';
import Modal from '@/components/UI/Modal';
import { getArticleImageUrl } from '@/lib/utils';
import { useState } from 'react';

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
              imageSrc={getArticleImageUrl(
                contributor.images,
                'mobileDetailsPageBackground'
              )}
              countryName={contributor.countryName}
            />
          </div>
        ))}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedContributor ? (
          <div className="py-5 px-3">
            <div className="flex content-center mb-5">
              <div>
                <ImageComponent
                  src={getArticleImageUrl(
                    selectedContributor?.images,
                    'mobileDetailsPageBackground'
                  )}
                  width={150}
                  height={150}
                  alt={selectedContributor?.name}
                  className="rounded-full"
                />
              </div>

              <div className="pl-10">
                <h6 className="font-bold text-xl">
                  {selectedContributor?.name}
                </h6>
                <ul className="flex px-3 py-5">
                  {selectedContributor.twitterUrl && (
                    <li className="pr-5">
                      <a href={selectedContributor.twitterUrl}>
                        <TwitterIcon width={20} height={20} />
                      </a>
                    </li>
                  )}
                  {selectedContributor.linkedinUrl && (
                    <li className="pr-5">
                      <a href={selectedContributor.linkedinUrl}>
                        <LinkedinIcon width={20} height={20} />
                      </a>
                    </li>
                  )}
                  {selectedContributor.instagramUrl && (
                    <li>
                      <a href={selectedContributor.instagramUrl}>
                        <InstagramIcon width={20} height={20} />
                      </a>
                    </li>
                  )}
                </ul>
                {selectedContributor.countryName && (
                  <span className="bg-gray-100 border inline-block text-sm text-gray-500 px-3 py-2">
                    {selectedContributor.countryName}
                  </span>
                )}
              </div>
            </div>
            <p>{selectedContributor.aboutTheAnchor}</p>
          </div>
        ) : (
          ''
        )}
      </Modal>
    </>
  );
};
