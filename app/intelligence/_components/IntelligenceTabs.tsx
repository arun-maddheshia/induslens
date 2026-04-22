'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'OSINT', href: '/intelligence' },
  { label: 'Worldview', href: '/intelligence/worldview' },
];

export default function IntelligenceTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-10 flex items-center justify-center gap-8">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
