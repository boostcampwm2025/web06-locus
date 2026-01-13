import type { Location } from '@/features/record/types';

export interface RecordCardProps {
  title: string;
  location: Location;
  date: Date;
  tags: string[];
  connectionCount: number;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
}
