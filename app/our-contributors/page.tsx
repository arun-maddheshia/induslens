
import { Metadata } from 'next';
import ContributorsList from './_components/ContributorsList';

const pageTitle = 'Our Contributors';
const pageDescription = '';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_API_URL}/our-contributors`,
  },
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

const page = () => {
  
  return (
    <section className="container mx-auto px-4 py-10 md:px-0">
      <h1 className="mb-10 text-center text-4xl font-bold">Our Contributors</h1>
      <ContributorsList />
    </section>
  );
};

export default page;
