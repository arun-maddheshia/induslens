import { Metadata } from 'next';
import IntelligenceArticleList from './_components/IntelligenceArticleList';

export const metadata: Metadata = {
  title: 'Intelligence — OSINT',
  description: 'Distilled & Curated Insights from Global Open Source Intelligence.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_API_URL}/intelligence` },
  openGraph: {
    title: 'Intelligence — OSINT',
    description: 'Distilled & Curated Insights from Global Open Source Intelligence.',
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: 'Intelligence — OSINT',
    description: 'Distilled & Curated Insights from Global Open Source Intelligence.',
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
};

export default function OsintPage() {
  return (
    <IntelligenceArticleList
      categoryId="IndusLens_OSINT"
      categorySlug="IndusLens-OSINT"
    />
  );
}
