import Link from 'next/link';
import Image from 'next/image';

export default function NotFoundPage() {
  return (
    <section className="w-full pb-20 text-center">
      <Image
        className="mx-auto mb-10 mt-20"
        width={500}
        height={392}
        src="/not-found.svg"
        alt="404"
      />
      <h1 className="text-4xl font-bold text-border">Oops!</h1>
      <p className="mb-10 text-lg font-semibold text-border">
        Sorry, we’re not able to find what you were looking for.
      </p>
      <Link className="px-10 py-3 text-sm bg-black text-white" href="/">
        BACK TO HOME
      </Link>
    </section>
  );
}
