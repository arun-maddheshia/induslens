export const getContributors = async (offset: number, limit: number) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${apiUrl}/api/contributors?offset=${offset}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const r: PaginatedResponse<Author> = await response.json();

    return r;
  } catch (error: unknown) {
    console.error('Error fetching contributors:', error);
    throw new Error(`An error happened: ${error}`);
  }
};
