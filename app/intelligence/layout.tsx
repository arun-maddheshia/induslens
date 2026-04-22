import IntelligenceTabs from './_components/IntelligenceTabs';

export default function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="tv-container mx-auto my-2 px-2 py-0 pb-10 md:pb-0 lg:py-10">
      <IntelligenceTabs />
      {children}
    </section>
  );
}
