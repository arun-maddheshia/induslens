export const fetchCategoryArticles = async (
  page: number = 1,
  limit: number = 10,
  category: string = ''
) => {
  console.log(category);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/category?page=${page}&limit=${limit}&category=${category}`
  );
  const data = await response.json();
  return data;
};
