import { Metadata } from 'next';
import React from 'react';
const content = [
  {
    heading: 'Acceptance of Terms',
    description:
      'By accessing, reading, or using induslens.com ("Website"), you agree to be bound by these Terms of Use and all terms, policies, and guidelines incorporated by reference. If you do not agree with these terms, please do not use this Website.',
  },
  {
    heading: 'Ownership of Content',
    description:
      'All content published on this Website, including stories, articles, images, logos, and other materials, is owned by induslens.com and is protected by international copyright laws.',
  },
  {
    heading: 'Use of Content',
    description:
      'Users are allowed to read, print, or download website content for personal, non-commercial use only. Any other use, including reproduction, modification, distribution, or republication, without the prior written consent of induslens.com is strictly prohibited.',
  },
  {
    heading: 'User Conduct',
    description:
      'Users must not: <ul><li>Use the Website in any way that causes harm, is illegal, or promotes illegal activities.</li><li>Attempt to gain unauthorized access to any portion of the Website.</li><li>Use the Website to distribute malicious software or spam.</li></ul>',
  },
  {
    heading: 'Links to Other Websites',
    description:
      'Our Website may contain links to third-party websites. We are not responsible for the content, accuracy, or opinions on these websites.',
  },
  {
    heading: 'Disclaimers',
    description:
      'The content on induslens.com is provided "as is". We do not guarantee the accuracy, completeness, or timeliness of the content and hereby disclaim all warranties, expressed or implied.',
  },
  {
    heading: 'Limitation of Liability',
    description:
      'In no event will induslens.com be liable for any damages, including without limitation, direct, indirect, incidental, or consequential damages arising out of the use of this Website.',
  },
  {
    heading: 'Changes to These Terms',
    description:
      'We reserve the right to modify these Terms of Use at any time. It is your responsibility to check these Terms periodically for changes.',
  },
  {
    heading: 'Governing Law',
    description:
      'These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of India.',
  },
  {
    heading: ' Contact Us',
    description:
      'For any privacy-related concerns, please reach out to us at <a href="mailto:editor@induslens.com">editor@induslens.com</a>.',
  },
];

const pageTitle = 'Terms of Use';
const pageDescription =
  'All content published on this Website, including stories, articles, images, logos, and other materials, is owned by induslens.com and is protected by international copyright laws.';

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
    <section className="tv-container mx-auto py-20">
      <h1 className="text-center font-bold text-3xl mb-5">Terms of Use</h1>
      <p>Last Updated: 18/10/2023</p>
      {content.map((text, index) => {
        return (
          <div className="mb-5" key={`content_terms_${index}`}>
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
