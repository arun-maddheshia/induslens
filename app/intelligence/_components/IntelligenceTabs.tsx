'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'OSINT',     href: '/intelligence'           },
  { label: 'Worldview', href: '/intelligence/worldview' },
];

export default function IntelligenceTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-8 border-b border-gray-200 mb-10">
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
