import { EmailIcon } from '@/components/Icons/EmailIcon';
import { Metadata } from 'next';

const pageTitle = 'About us';
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

export default function page() {
  return (
    <section className="main-container mx-auto py-20">
      <div className="grid grid-cols-2 gap-20">
        <div className="px-10">
          <h1 className="font-extrabold text-black text-4xl mb-5">
            Curious to see and hear more?{' '}
            <span className="text-pink-700">Let&apos;s connect</span>.
          </h1>
          <p className="mb-5">
            Got a question? A suggestion? Need some information? We would love
            to hear from you.
          </p>
          <div className="flex items-center space-x-4">
            <div className="emailContainer flex justify-center content-center items-center rounded-full">
              <EmailIcon width={20} height={17} fill="transparent" />
            </div>
            <a href="mailto:editor@Induslens.com">editor@Induslens.com</a>
          </div>
        </div>
        <div></div>
      </div>
    </section>
  );
}
