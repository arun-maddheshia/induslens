import { Metadata } from 'next';
import IntelligenceArticleList from '../_components/IntelligenceArticleList';

export const metadata: Metadata = {
  title: 'Intelligence — Worldview',
  description: 'India\'s Worldview — global perspectives through an Indian lens.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_API_URL}/intelligence/worldview` },
  openGraph: {
    title: 'Intelligence — Worldview',
    description: 'India\'s Worldview — global perspectives through an Indian lens.',
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: 'Intelligence — Worldview',
    description: 'India\'s Worldview — global perspectives through an Indian lens.',
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
};

export default function WorldviewPage() {
  return (
    <IntelligenceArticleList
      categoryId="Worldview_India"
      categorySlug="Worldview-India"
    />
  );
}
