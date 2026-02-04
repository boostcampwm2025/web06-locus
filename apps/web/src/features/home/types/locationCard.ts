/**
 * 모바일 지도에서 처음 기록(핀) 클릭 시 보이는 플로팅 카드 Props
 */
export interface LocationCardProps {
  image?: string;
  title: string;
  subtitle: string;
  onViewDetail?: () => void;
}
