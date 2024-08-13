export const fetchEminence = async (
  page: number = 1,
  limit: number = 10,
  category: string = 'Indus_Eminence',
  slug: string = ''
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/eminence?page=${page}&limit=${limit}&category=${category}&slug=${slug}`
  );
  const data = await response.json();
  return data;
};
