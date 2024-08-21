'use client';
import { useEffect, useRef, useState } from 'react';

import {
  FacebookIcon,
  LinkedinIcon,
  ShareIcon,
  TwitterIcon,
} from '@/components/Icons';

import {
  getFacebookShareUrl,
  getLinkedinShareUrl,
  getTwitterShareUrl,
} from '@/lib/utils';
import SocialShare from '@/components/ArticleView/SocialShare';
import { CopyToClipboard } from '@/components/CopyToClipboard';

type ShareProps = {
  shareUrl: string;
  title: string;
};

export function Share({ shareUrl, title }: ShareProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button className="" onClick={toggleMenu}>
        <ShareIcon width={24} height={24} stroke="#000" />
      </button>

      <ul
        className={`absolute right-0 z-10 mt-2 flex w-48 origin-top-right transform flex-col gap-4 rounded-lg border bg-white p-4 shadow-lg transition-all duration-300 ease-out ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <li>
          <a
            href={getFacebookShareUrl(shareUrl)}
            target="_blank"
            className="flex text-sm hover:text-gray-700"
          >
            <FacebookIcon width={20} height={20} fill="#000" />
            &nbsp;Facebook
          </a>
        </li>
        <li>
          <a
            href={getTwitterShareUrl(shareUrl, title)}
            target="_blank"
            className="flex text-sm hover:text-gray-700"
          >
            <TwitterIcon width={20} height={20} fill="#000" />
            &nbsp;Twitter
          </a>
        </li>
        <li>
          <a
            href={getLinkedinShareUrl(shareUrl)}
            target="_blank"
            className="flex text-sm hover:text-gray-700"
          >
            <LinkedinIcon width={20} height={20} fill="#000" />
            &nbsp;Linkedin
          </a>
        </li>
        <li className="text-sm">
          <CopyToClipboard url={shareUrl} hasTitle />
        </li>
      </ul>
    </div>
  );
}

export default SocialShare;
