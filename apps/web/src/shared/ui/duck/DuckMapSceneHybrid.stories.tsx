import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DuckMapSceneHybrid } from './DuckMapSceneHybrid';
import type { DuckPosition } from '@/shared/hooks/useDuckWalker';

const meta = {
  title: 'Shared/UI/Duck/DuckMapSceneHybrid',
  component: DuckMapSceneHybrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { description: '오리 뒤에 깔릴 콘텐츠(지도 등)' },
    hint: { description: '안내 문구. 없으면 표시 안 함' },
    initialPos: {
      control: 'object',
      description: '오리 초기 위치 (픽셀)',
    },
    height: {
      control: { type: 'number', min: 300, max: 700, step: 50 },
    },
    duration: {
      control: { type: 'number', min: 0.5, max: 5, step: 0.5 },
    },
    bounce: {
      control: 'boolean',
    },
    wanderOptions: {
      control: 'object',
      description: 'idleIntervalMs, wanderRadiusPx, enabled',
    },
  },
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 2,
    bounce: true,
    wanderOptions: { idleIntervalMs: 4000, wanderRadiusPx: 80, enabled: true },
    className: 'rounded-lg bg-slate-100',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DuckMapSceneHybrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 평상시 근처를 배회하고, 클릭하면 그쪽으로 걸어갑니다. (스토리북 데모용 배경·힌트) */
export const Default: Story = {
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 2,
    bounce: true,
    wanderOptions: { idleIntervalMs: 4000, wanderRadiusPx: 80, enabled: true },
    className: 'rounded-lg bg-slate-100',
    hint: '평상시 근처를 배회합니다. 클릭하면 그쪽으로 걸어갑니다.',
  },
};

/** "항로 보기"처럼 목표를 설정하면 오리가 그 지점으로 걸어갑니다. (지정 경로 + 자유 배회 하이브리드) */
export const WithLocusTarget: Story = {
  render: function WithLocusTargetRender() {
    const [target, setTarget] = useState<DuckPosition | null>(null);
    const locusPoint: DuckPosition = { x: 280, y: 350 };

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600"
            onClick={() => setTarget({ ...locusPoint })}
          >
            항로 보기 (시뮬레이션)
          </button>
          <span className="text-xs text-slate-500">
            클릭하면 오리가 (280, 350)으로 걸어갑니다
          </span>
        </div>
        <DuckMapSceneHybrid
          className="rounded-lg bg-slate-100"
          initialPos={{ x: 120, y: 200 }}
          height={500}
          duration={2}
          bounce
          target={target}
          wanderOptions={{ idleIntervalMs: 4000, wanderRadiusPx: 80 }}
          hint="평상시 근처를 배회합니다. 위 버튼으로 '항로 보기'를 시뮬레이션하거나, 영역을 클릭해 이동할 수 있습니다."
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '사용자가 기록 카드를 클릭하거나 "항로 보기"를 누르면 target에 해당 지점(픽셀)을 넘기면 오리가 그쪽으로 걸어갑니다. 평상시에는 근처를 랜덤 배회합니다.',
      },
    },
  },
};

/** 배회만 빠르게 해서 동작을 확인합니다. */
export const FastWander: Story = {
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 1.2,
    bounce: true,
    wanderOptions: { idleIntervalMs: 2000, wanderRadiusPx: 60, enabled: true },
    className: 'rounded-lg bg-slate-100',
  },
};

/** idle 배회를 끄면 클릭/지정 경로만 동작합니다. */
export const IdleDisabled: Story = {
  args: {
    initialPos: { x: 120, y: 200 },
    height: 500,
    duration: 2,
    bounce: true,
    wanderOptions: { idleIntervalMs: 4000, wanderRadiusPx: 80, enabled: false },
    className: 'rounded-lg bg-slate-100',
  },
  parameters: {
    docs: {
      description: {
        story:
          'enabled: false로 두면 평상시 배회는 하지 않고, 클릭이나 setTarget으로만 이동합니다.',
      },
    },
  },
};
