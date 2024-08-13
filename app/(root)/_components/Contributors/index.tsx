import { ContributorWrapper } from './ContributorWrapper';
import { anchors } from '@/data/anchor';

export default function FeaturedContributor() {
  return <ContributorWrapper contributorList={anchors} />;
}
