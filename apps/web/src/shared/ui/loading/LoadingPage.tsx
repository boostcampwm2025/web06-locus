import type { LoadingPageProps, LoadingPageVersion } from '@/shared/types';
import LoadingPageV1 from './LoadingPageV1';
import LoadingPageV2 from './LoadingPageV2';
import LoadingPageV3 from './LoadingPageV3';

const LOADING_PAGES: Record<LoadingPageVersion, React.ComponentType> = {
  1: LoadingPageV1,
  2: LoadingPageV2,
  3: LoadingPageV3,
} as const;

export default function LoadingPage({ version = 1 }: LoadingPageProps) {
  const LoadingVariant = LOADING_PAGES[version];
  return <LoadingVariant />;
}
