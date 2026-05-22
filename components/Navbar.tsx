'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Intelligence', href: '/intelligence' },
  { name: 'IndusTV', href: '/industv' },
  { name: 'Eminence', href: '/indus-eminence' },
  { name: 'Specials', href: '/specials' },
  { name: 'Our Contributors', href: '/our-contributors' },
  { name: 'Indian Stories', href: '/indian-stories' },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-black">
      <nav className="flex items-center justify-between gap-6 px-6 py-3 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 outline-0 hover:outline-0 focus:outline-0">
          <Image src="/logo.svg" width={160} height={50} alt="IndusLens" className="w-32 md:w-44" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="text-gray-300 text-sm font-medium hover:text-white transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-gray-300 hover:text-white transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <ul className="lg:hidden flex flex-col border-t border-white/10 px-6 py-4 gap-1">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
};
