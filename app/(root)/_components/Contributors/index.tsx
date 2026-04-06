'use client';

import { useEffect, useState } from 'react';
import { ContributorWrapper } from './ContributorWrapper';

export default function FeaturedContributor() {
  const [contributors, setContributors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/featured-authors');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch contributors');
        }

        if (result.success) {
          setContributors(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch contributors');
        }
      } catch (err) {
        console.error('Error fetching contributors:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8 text-red-600">
        <span>Error loading contributors: {error}</span>
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 text-muted-foreground">
        <span>No contributors found</span>
      </div>
    );
  }

  return <ContributorWrapper contributorList={contributors} />;
}
