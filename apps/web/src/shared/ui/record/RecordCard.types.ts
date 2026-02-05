import type { Location } from '@/features/record/types';
import type { Image } from '@locus/shared';

export interface RecordCardProps {
  recordId: string;
  title: string;
  location: Location;
  date: Date;
  tags: string[];
  connectionCount: number;
  image?: Image;
  onClick?: () => void;
  className?: string;
}
