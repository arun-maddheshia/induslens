import ContributorsList from './_components/ContributorsList';

async function fetchContributors(): Promise<Author[]> {
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

const page = async () => {
  const data = await fetchContributors();

  if (!data) {
    return;
  }

  return (
    <section className="container py-10 mx-auto">
      <h1 className="font-bold text-4xl text-center mb-10">Our Contributors</h1>
      <ContributorsList initialContributors={data} />
    </section>
  );
};

export default page;
