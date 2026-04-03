'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { footerLinks } from '@/lib/settings';
import { usePathname } from 'next/navigation';

export const Footer = () => {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname.includes('/admin')) {
    return <></>;
  }


  return (
    <footer className="bg-black pb-5 pt-10 lg:pb-10 lg:pt-20">
      <div className="container mx-auto pb-10">
        <div className="px-4 lg:grid lg:grid-cols-2">
          <div>
            <Link href="/">
              <Image src="/logo.svg" width={220} height={70} alt="IndusLens" />
            </Link>
            <p className="mb-10 text-sm text-white lg:mb-0">
              Chronicling cutting-edge global perspectives on India&apos;s
              success stories
            </p>
          </div>
          <div className="footerLinks flex justify-between">
            {footerLinks.map((footerLink, index) => {
              return (
                <ul className="text-white" key={`footer_group_${index}`}>
                  <h5 className="font-sm mb-3 font-bold uppercase">
                    {footerLink.group}
                  </h5>
                  {footerLink.urls.map((url) => (
                    <li key={url.name}>
                      <Link
                        className="text-sm text-neutral-400"
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
      <div className="container mx-auto px-4 pt-5 lg:pt-10">
        <p className="text-sm text-white">
          &copy; {year} Induslens&reg; ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};
