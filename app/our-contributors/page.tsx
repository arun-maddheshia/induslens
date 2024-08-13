import ContributorsList from './_components/ContributorsList';
import { anchors } from '@/data/anchor';

const page = async () => {
  return (
    <section className="container py-10 mx-auto">
      <h1 className="font-bold text-4xl text-center mb-10">Our Contributors</h1>
      <ContributorsList initialContributors={anchors} />
    </section>
  );
};

export default page;
