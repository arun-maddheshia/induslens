import Image from 'next/image';
import Link from 'next/link';

const navLinks = [
  { name: 'Intelligence', href: '/intelligence' },
  { name: 'IndusTV', href: '/industv' },
  { name: 'Eminence', href: '/indus-eminence' },
  { name: 'Specials', href: '/specials' },
  { name: 'Our Contributors', href: '/our-contributors' },
  { name: 'Indian Stories', href: '/industales' },
];

export const Navbar = () => {
  return (
    <header className="bg-black px-10 py-3">
      <nav className="flex items-center justify-between gap-6">
        {/* Logo — left */}
        <Link href="/" className="flex-shrink-0 outline-0 hover:outline-0 focus:outline-0">
          <Image src="/logo.svg" width={220} height={70} alt="IndusLens" />
        </Link>

        {/* All nav links — right */}
        <ul className="flex items-center gap-6">
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
      </nav>
    </header>
  );
};
