import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "IndusTales | Connect with India's Rise",
  description:
    "A digital platform showcasing India's Rise to global investors, businesses, influencers, policy makers, and academia through Indian thought leadership on entrepreneurship and innovation",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_API_URL}/industales` },
  openGraph: {
    title: "IndusTales | Connect with India's Rise",
    description:
      "A digital platform showcasing India's Rise to global investors, businesses, influencers, policy makers, and academia through Indian thought leadership on entrepreneurship and innovation",
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: "IndusTales | Connect with India's Rise",
    description:
      "A digital platform showcasing India's Rise to global investors, businesses, influencers, policy makers, and academia through Indian thought leadership on entrepreneurship and innovation",
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
}

export default function IndusTalesLayout({ children }: { children: React.ReactNode }) {
  return children
}
