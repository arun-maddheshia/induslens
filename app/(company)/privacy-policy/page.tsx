import { Metadata } from 'next';
import React from 'react';
const content = [
  {
    heading: 'Introduction',
    description:
      'Welcome to induslens.com. We are committed to respecting your online privacy. This privacy policy explains the practices employed when you visit our website.',
  },
  {
    heading: 'General Information',
    description:
      'Our primary purpose is to showcase stories about India. While our website is hosted in India, we cater to a global audience.',
  },
  {
    heading: 'Collection of Information',
    description:
      'We do not directly collect any personal information from our visitors. However, we use third-party tools like Google Tag Manager and Microsoft Clarity for analytics purposes. These tools might collect data on our behalf for better user understanding and site improvements.',
  },
  {
    heading: 'Use of Information',
    description:
      "Any information collected via third-party tools is used solely for analytics. We don't share this data with any other third parties.",
  },
  {
    heading: ' Data Storage and Security',
    description:
      'As we do not collect data directly, we do not store any personal information on our servers.',
  },
  {
    heading: ' User Rights and Choices',
    description:
      'Since we do not collect personal information, there are no direct user rights related to data access, modification, or deletion.',
  },
  {
    heading: 'Third-Party Services',
    description:
      'We use plugins like Google Tag Manager and Microsoft Clarity. We advise you to review their privacy policies to understand their practices.',
  },
  {
    heading: " Children's Privacy",
    description:
      "We respect the privacy of children. As we do not collect personal data, there are no concerns related to the collection of children's data.",
  },
  {
    heading: 'Data Transfers',
    description:
      'There are no cross-border data transfers as we do not collect personal data.',
  },

  {
    heading: ' Updates to the Privacy Policy',
    description:
      'We might update our privacy policy from time to time. While these updates are not frequent, we advise users to occasionally review this policy for any changes.',
  },
  {
    heading: ' Contact Us',
    description:
      'For any privacy-related concerns, please reach out to us at <a href="mailto:editor@induslens.com">editor@induslens.com</a>.',
  },
];

const pageTitle = 'Privacy Policy';
const pageDescription =
  'Welcome to induslens.com. We are committed to respecting your online privacy.';

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
      <h1 className="text-center font-bold text-3xl mb-5">Privacy Policy</h1>
      <p>Last Updated: 18/10/2023</p>
      {content.map((text, index) => {
        return (
          <div className="mb-5" key={`content_pp_${index}`}>
            <h5 className="font-bold text-lg">
              {index + 1}. {text.heading}
            </h5>
            <p dangerouslySetInnerHTML={{ __html: text.description }}></p>
          </div>
        );
      })}
    </section>
  );
}
