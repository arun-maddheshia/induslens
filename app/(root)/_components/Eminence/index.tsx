import { EminenceWrapper } from './EminenceWrapper';

export async function fetchEminence(): Promise<Eminence[]> {
  try {
    const page: number = 1;
    const limit: number = 10;
    const category: string = 'Indus_Eminence';
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/eminence?page=${page}&limit=${limit}&category=${category}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const { data }: { data: Eminence[] } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching eminence :', error);
    return [];
  }
}

export default async function FeaturedEminence() {
  const data = await fetchEminence();

  return <EminenceWrapper eminenceData={data} />;
}
