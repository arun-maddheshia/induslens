import { getContributors } from '@/actions/getContributors';
import { ContributorWrapper } from './ContributorWrapper';

export default async function FeaturedContributor() {
  const apiResponse: PaginatedResponse<Author> = await getContributors(0, 32);
  const contributors = apiResponse.data;

  return <ContributorWrapper contributorList={contributors} />;
}
