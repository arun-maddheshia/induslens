import Image from 'next/image';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className="flex justify-center bg-black pl-10 pr-10 relative">
      <Link href="/" className="outline-0 hover:outline-0 focus:outline-0">
        <Image src="/logo.svg" width={220} height={70} alt="IndusLens" />
      </Link>
    </nav>
  );
};
