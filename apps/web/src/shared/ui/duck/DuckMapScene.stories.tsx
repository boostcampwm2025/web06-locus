import type { Meta, StoryObj } from '@storybook/react-vite';
import { DuckMapScene } from './DuckMapScene';

const meta = {
  title: 'Shared/UI/Duck/DuckMapScene',
  component: DuckMapScene,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialPos: {
      control: 'object',
      description: '오리 초기 위치 (픽셀)',
    },
    height: {
      control: { type: 'number', min: 300, max: 700, step: 50 },
      description: '씬 높이(px)',
    },
    duration: {
      control: { type: 'number', min: 0.5, max: 5, step: 0.5 },
      description: '이동 애니메이션 시간(초)',
    },
    bounce: {
      control: 'boolean',
      description: '이동 중 위아래로 살짝 튀는 애니메이션',
    },
    hint: {
      control: 'text',
      description: '안내 문구',
    },
  },
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 2,
    bounce: true,
    hint: '지도 위를 클릭하면 오리가 걸어갑니다!',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DuckMapScene>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 클릭한 위치로 오리가 걸어갑니다. 이동 중에는 살짝 통통 튀는 연출이 적용됩니다. */
export const Default: Story = {
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 2,
    bounce: true,
  },
};

/** 보조 애니메이션 없이 이동만 확인합니다. */
export const NoBounce: Story = {
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 2,
    bounce: false,
    hint: '클릭하면 오리가 이동합니다 (보조 애니메이션 없음)',
  },
};

/** 이동 속도를 빠르게 해서 테스트합니다. */
export const FastWalk: Story = {
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 0.8,
    bounce: true,
    hint: '빠르게 걸어갑니다!',
  },
};
