import ContactForm from '@/components/ContactForm';
import { EmailIcon } from '@/components/Icons/EmailIcon';
import { Metadata } from 'next';

const pageTitle = 'Contact us';
const pageDescription = "Curious to see and hear more? Let's connect.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_API_URL}/contact-us`,
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

export default function page() {
  return (
    <section className="main-container mx-auto py-20">
      <div className="md:grid md:grid-cols-[50%_minmax(40%,_1fr)_5%] lg:grid-cols-[60%_minmax(30%,_1fr)_5%]">
        <div className="px-5 pb-10 md:px-10 md:pb-0">
          <h1 className="mb-5 text-4xl font-extrabold text-black lg:pt-5">
            Curious to see and hear more?{' '}
            <span className="text-pink-700">Let&apos;s connect</span>.
          </h1>
          <p className="mb-5">
            Got a question? A suggestion? Need some information? We would love
            to hear from you.
          </p>
          <div className="flex items-center space-x-4">
            <div className="emailContainer flex content-center items-center justify-center rounded-full">
              <EmailIcon width={20} height={17} fill="transparent" />
            </div>
            <a href="mailto:editor@Induslens.com">editor@Induslens.com</a>
          </div>
        </div>
        <div className="px-5 md:px-0">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
