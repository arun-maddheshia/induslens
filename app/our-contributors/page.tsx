import { Metadata } from 'next';
import ContributorsList from './_components/ContributorsList';
import { anchors } from '@/data/anchor';

const pageTitle = 'Our Contributors';
const pageDescription = '';

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

const page = () => {
  return (
    <section className="container py-10 mx-auto px-4 md:px-0">
      <h1 className="font-bold text-4xl text-center mb-10">Our Contributors</h1>
      <ContributorsList initialContributors={anchors} />
    </section>
  );
};

export default page;
