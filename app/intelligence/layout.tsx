import IntelligenceTabs from './_components/IntelligenceTabs';

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="container mx-auto px-4 py-10 lg:px-0">
      <IntelligenceTabs />
      {children}
    </section>
  );
}
