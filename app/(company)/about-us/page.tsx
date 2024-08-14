import { Metadata } from 'next';
import React from 'react';

const pageTitle = 'About us';
const pageDescription =
  "At IndusLens, we are dedicated to spotlighting and deciphering this pivotal transition by harnessing voices from around the world. We are not just passive narrators; we are passionate advocates, viewing India's metamorphosis through a global lens. Our goal is to present the international community with a well-rounded and in-depth portrayal of India's rise.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: pageTitle,
    description: pageDescription,
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
};

export default function page() {
  return (
    <section className="tv-container mx-auto py-20 px-4 lg:px-0">
      <h1 className="text-center font-bold text-3xl mb-5">About Us</h1>

      <div className="mb-5">
        <h2 className="font-bold text-lg mb-1">
          Chronicling India&apos;s Rise
        </h2>
        <p className="text-lg mb-5">
          India stands at the precipice of a monumental socio-economic shift.
          Predictions from esteemed global analysts and visionaries suggest that
          by 2050, India&apos;s purchasing power could parallel established
          global economic titans.
        </p>
        <p className="text-lg mb-5">
          India&apos;s present-day narrative is shaped by a fusion of dynamic
          elements: a flourishing entrepreneurial spirit, trailblazing
          technological breakthroughs, and pivotal policy advancements.
          Together, these factors coalesce, setting the stage for India&apos;s
          remarkable growth trajectory.
        </p>
        <h3 className="font-bold text-lg">Our Mission at IndusLens</h3>
        <p className="text-lg mb-5">
          At IndusLens, we are dedicated to spotlighting and deciphering this
          pivotal transition by harnessing voices from around the world. We are
          not just passive narrators; we are passionate advocates, viewing
          India&apos;s metamorphosis through a global lens. Our goal is to
          present the international community with a well-rounded and in-depth
          portrayal of India&apos;s rise.
        </p>
        <p className="text-lg mb-5">
          To our readers, we promise perspectives that are not only insightful
          and transparent but also deeply illuminating. We aim to encapsulate
          the vibrancy and pace of India&apos;s progression as aglobal power for
          the good of all.
        </p>
        <p className="text-lg mb-5">
          Embark on this journey with us as we delve into the diverse facets
          that are thrusting India towards global pre-eminence. Let&apos;s
          collectively celebrate India&apos;s Ascent in a multi-polar world.
        </p>
      </div>
    </section>
  );
}
