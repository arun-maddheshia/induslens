import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { footerLinks } from '@/lib/settings';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black pt-10 lg:pt-20 pb-5 lg:pb-10">
      <div className="container mx-auto pb-10">
        <div className="lg:grid lg:grid-cols-2 px-5 lg:px-0">
          <div>
            <Link href="/">
              <Image src="/logo.svg" width={220} height={70} alt="IndusLens" />
            </Link>
            <p className="text-white text-sm mb-10 lg:mb-0">
              Chronicling cutting-edge global perspectives on India&apos;s
              success stories
            </p>
          </div>
          <div className="flex footerLinks justify-between">
            {footerLinks.map((footerLink, index) => {
              return (
                <ul className="text-white" key={`footer_group_${index}`}>
                  <h5 className="uppercase font-sm font-bold mb-3">
                    {footerLink.group}
                  </h5>
                  {footerLink.urls.map((url) => (
                    <li key={url.name}>
                      <Link
                        className="text-neutral-400 text-sm"
                        href={`/${url.url}`}
                      >
                        {url.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>
        </div>
      </div>
      <hr className="border-t border-neutral-700" />
      <div className="container mx-auto pt-5 lg:pt-10 px-5 lg:px-0">
        <p className="text-white text-sm">
          &copy; {year} Induslens&reg; ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};
