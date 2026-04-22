import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IndusLens | Chronicling cutting-edge global perspectives on India\'s success stories',
  description:
    "Explore India's vibrant journey to 2050 as a global economic powerhouse, guided by insightful global perspectives on its innovative entrepreneurship, tech revolution, pivotal policies and its dazzling soft power.",
  alternates: { canonical: process.env.NEXT_PUBLIC_API_URL },
  openGraph: {
    title: 'IndusLens | Chronicling cutting-edge global perspectives on India\'s success stories',
    description:
      "Explore India's vibrant journey to 2050 as a global economic powerhouse, guided by insightful global perspectives on its innovative entrepreneurship, tech revolution, pivotal policies and its dazzling soft power.",
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: 'IndusLens | Chronicling cutting-edge global perspectives on India\'s success stories',
    description:
      "Explore India's vibrant journey to 2050 as a global economic powerhouse, guided by insightful global perspectives on its innovative entrepreneurship, tech revolution, pivotal policies and its dazzling soft power.",
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children
}
