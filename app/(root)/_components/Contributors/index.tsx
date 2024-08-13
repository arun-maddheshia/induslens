import { ContributorWrapper } from './ContributorWrapper';

async function fetchFeaturedContributor(): Promise<Author[]> {
  try {
    const offset: number = 0;
    const limit: number = 32;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/contributors?offset=${offset}&limit=${limit}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const { data }: { data: Author[] } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching eminence :', error);
    return [];
  }
}

export default async function FeaturedContributor() {
  const data = await fetchFeaturedContributor();

  return <ContributorWrapper contributorList={data} />;
}
