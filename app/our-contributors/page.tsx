import { getContributors } from '@/actions/getContributors';
import ContributorsList from './_components/ContributorsList';

export default async function page() {
  const apiResponse: PaginatedResponse<Author> = await getContributors(0, 10);
  const contributors = apiResponse.data;

  return (
    <section className="container py-10 mx-auto">
      <h1 className="font-bold text-4xl text-center mb-10">Our Contributors</h1>
      <ContributorsList initialContributors={contributors} />
    </section>
  );
}
