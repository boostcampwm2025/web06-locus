import { MapPinIcon, FileTextIcon, Link2Icon } from '@/shared/icons';
import { ONBOARDING_IMAGES } from './onboardingImages';
import type {
  FloatingCard,
  ConnectingPath,
  RecordCard,
  FlowStep,
  MapMemory,
} from '../types/onboarding';

/**
 * 페이지 1 데이터
 */

export const PAGE1_FLOATING_CARDS: FloatingCard[] = [
  {
    id: 1,
    src: ONBOARDING_IMAGES.cafe,
    delay: 0.2,
    x: '10%',
    y: '20px',
    rotation: -8,
    scale: 0.9,
  },
  {
    id: 2,
    src: ONBOARDING_IMAGES.park,
    delay: 0.4,
    x: '55%',
    y: '10px',
    rotation: 6,
    scale: 1.1,
  },
  {
    id: 3,
    src: ONBOARDING_IMAGES.citySunset,
    delay: 0.6,
    x: '25%',
    y: '160px',
    rotation: -4,
    scale: 0.85,
  },
];

export const PAGE1_CONNECTING_PATHS: ConnectingPath[] = [
  { d: 'M 80 80 Q 150 120, 250 70 M 250 70 Q 180 150, 140 210', delay: 0.8 },
];

export const PAGE1_CONTENT = {
  title: '기억은 혼자 남지 않아요.',
  subtitle:
    '장소에서 시작된 기록들이\n서로 연결되며 하나의 이야기로 이어집니다.',
} as const;

/**
 * 페이지 2 데이터
 */
export const PAGE2_RECORD_CARDS: RecordCard[] = [
  {
    id: 1,
    src: ONBOARDING_IMAGES.cafe,
    title: '오늘의 카페',
    x: '8%',
    y: '40px',
    rotation: -6,
    delay: 0.2,
    scale: 0.95,
  },
  {
    id: 2,
    src: ONBOARDING_IMAGES.park,
    title: '산책길에서',
    x: '52%',
    y: '20px',
    rotation: 5,
    delay: 0.4,
    scale: 1.05,
  },
  {
    id: 3,
    src: ONBOARDING_IMAGES.beach,
    title: '바다에서의 오후',
    x: '25%',
    y: '200px',
    rotation: -3,
    delay: 0.6,
    scale: 0.9,
  },
];

export const PAGE2_CONNECTING_PATHS: ConnectingPath[] = [
  { d: 'M 100 150 Q 180 120, 260 130', delay: 0.8 },
  { d: 'M 260 140 Q 220 200, 180 300', delay: 1.0 },
  { d: 'M 90 155 Q 100 230, 140 300', delay: 1.2 },
];

export const PAGE2_CONTENT = {
  title: '기록을 선으로 이어보세요.',
  subtitle:
    '같은 장소, 비슷한 순간, 이어지는 감정.\n자유롭게 기록을 연결하며 나만의 이야기를 만들어보세요.',
} as const;

/**
 * 페이지 3 데이터
 */
export const PAGE3_STEPS: FlowStep[] = [
  {
    id: 1,
    icon: MapPinIcon,
    text: '장소에 핀을 남기고',
    delay: 0.3,
    imageSrc: ONBOARDING_IMAGES.citySunset,
  },
  {
    id: 2,
    icon: FileTextIcon,
    text: '그 순간을 기록하고',
    delay: 0.5,
    imageSrc: ONBOARDING_IMAGES.bookstore,
  },
  {
    id: 3,
    icon: Link2Icon,
    text: '다른 기억과 연결해요',
    delay: 0.7,
    imageSrc: ONBOARDING_IMAGES.park,
  },
];

export const PAGE3_CONTENT = {
  title: '간단한 세 단계로\n시작할 수 있어요.',
} as const;

/**
 * 페이지 4 데이터
 */
export const PAGE4_MEMORIES: MapMemory[] = [
  {
    id: 1,
    src: ONBOARDING_IMAGES.cafe,
    x: '12%',
    y: '30px',
    delay: 0.1,
    size: 0.9,
  },
  {
    id: 2,
    src: ONBOARDING_IMAGES.citySunset,
    x: '62%',
    y: '50px',
    delay: 0.2,
    size: 1.1,
  },
  {
    id: 3,
    src: ONBOARDING_IMAGES.park,
    x: '8%',
    y: '160px',
    delay: 0.3,
    size: 0.85,
  },
  {
    id: 4,
    src: ONBOARDING_IMAGES.bookstore,
    x: '48%',
    y: '180px',
    delay: 0.4,
    size: 0.95,
  },
  {
    id: 5,
    src: ONBOARDING_IMAGES.beach,
    x: '65%',
    y: '210px',
    delay: 0.5,
    size: 0.8,
  },
  {
    id: 6,
    src: ONBOARDING_IMAGES.mountain,
    x: '25%',
    y: '290px',
    delay: 0.6,
    size: 1.0,
  },
];

export const PAGE4_CONNECTING_PATHS: ConnectingPath[] = [
  { d: 'M 70 70 Q 180 80, 290 90', delay: 0.7 },
  { d: 'M 70 70 L 60 200', delay: 0.8 },
  { d: 'M 290 90 Q 250 150, 220 220', delay: 0.9 },
  { d: 'M 60 200 Q 140 240, 220 220', delay: 1.0 },
  { d: 'M 220 220 Q 270 270, 310 250', delay: 1.1 },
  { d: 'M 60 200 Q 100 280, 140 330', delay: 1.2 },
  { d: 'M 220 220 L 140 330', delay: 1.3 },
];

export const PAGE4_CONTENT = {
  title: '흩어진 기억이,\n지도가 됩니다.',
  subtitle:
    '시간이 지나도 당신의 경험은 사라지지 않아요.\n연결된 기억들이 하나의 이야기로 남습니다.',
} as const;
