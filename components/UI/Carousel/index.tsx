'use client';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';
import styles from './Carousel.module.scss';

import { useRef } from 'react';

import { Navigation, Grid } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ChevronRightIcon, ChevronLeftIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

type CarouselProps = {
  items: React.ReactNode[];
  spaceBetween: number;
  slidesPerView: number;
  smSlidesPerView?: number;
  mdSlidesPerView?: number;
  gridRows: number;
  loop: boolean;
  navigationVariant?: 'center' | 'top';
};

export default function Carousel({
  items,
  spaceBetween,
  slidesPerView,
  gridRows,
  loop,
  smSlidesPerView,
  mdSlidesPerView,
  navigationVariant = 'center',
}: CarouselProps) {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const navigationVisibility = items.length > slidesPerView;

  return (
    <div className={styles.customCarousel}>
      {navigationVisibility && (
        <div
          className={cn(
            'hidden lg:block',
            styles.customCarouselNavigation,
            navigationVariant === 'top'
              ? styles.customCarouselNavigationTop
              : '',
          )}
        >
          <div className={styles.customCarouselNavigationLeft} ref={prevRef}>
            <ChevronLeftIcon
              width={20}
              height={20}
              stroke={navigationVariant === 'top' ? '#000' : '#fff'}
            />
          </div>
          <div className={styles.customCarouselNavigationRight} ref={nextRef}>
            <ChevronRightIcon
              width={20}
              height={20}
              stroke={navigationVariant === 'top' ? '#000' : '#fff'}
            />
          </div>
        </div>
      )}
      <Swiper
        modules={[Navigation, Grid]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        speed={1000}
        loop={navigationVisibility ? loop : false}
        grid={{ rows: gridRows, fill: 'row' }}
        breakpoints={{
          0: {
            slidesPerView: smSlidesPerView ? smSlidesPerView : 1,
          },
          768: {
            slidesPerView: mdSlidesPerView ? mdSlidesPerView : 1,
          },
          992: { slidesPerView: slidesPerView },
        }}
        navigation={{
          prevEl: prevRef.current!,
          nextEl: nextRef.current!,
        }}
        onInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide
            className={styles.customCarouselItem}
            key={`slide-item-${index}`}
          >
            {item}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
