import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { DuckSprite } from './DuckSprite';

const meta = {
  title: 'Shared/UI/Duck/DuckSprite',
  component: DuckSprite,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    angle: {
      control: { type: 'range', min: 0, max: 360, step: 15 },
      description: '바라보는 방향 각도 (0=동, 90=남, 180=서, 270=북)',
    },
    size: {
      control: { type: 'number', min: 32, max: 128, step: 8 },
      description: '오리 이미지 크기(px)',
    },
  },
  args: {
    angle: 90,
    size: 80,
  },
} satisfies Meta<typeof DuckSprite>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 각도 컨트롤로 방향을 바꿔 보며 오리가 움직이는(돌아가는) 걸 확인합니다. */
export const WithAngleControl: Story = {
  args: {
    angle: 90,
    size: 80,
  },
  render: (args) => (
    <div className="flex flex-col items-center gap-4 p-6">
      <p className="text-sm text-slate-600">
        슬라이더로 각도를 바꿔 보세요. 오리가 해당 방향으로 바라봅니다.
      </p>
      <DuckSprite {...args} />
    </div>
  ),
};

/** 일정 간격으로 각도가 바뀌어 오리가 계속 돌아가는 연출을 확인합니다. */
export const AutoRotate: Story = {
  render: () => {
    function AutoRotateDemo() {
      const [angle, setAngle] = useState(0);

      useEffect(() => {
        const id = setInterval(() => {
          setAngle((a) => (a + 8) % 360);
        }, 120);
        return () => clearInterval(id);
      }, []);

      return (
        <div className="flex flex-col items-center gap-4 p-6">
          <p className="text-sm text-slate-600">
            오리가 자동으로 회전합니다. (각도: {angle}°)
          </p>
          <DuckSprite angle={angle} size={80} />
        </div>
      );
    }
    return <AutoRotateDemo />;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '일정 시간마다 각도가 증가해 오리가 도는 것처럼 보입니다. 지도에서 이동 방향에 따라 스프라이트를 바꿀 때와 같은 느낌으로 테스트할 수 있습니다.',
      },
    },
  },
};

/** 8방향 오리를 한 번에 비교합니다. */
export const AllDirections: Story = {
  render: () => {
    const labels = [
      '동(0°)',
      '남동(45°)',
      '남(90°)',
      '남서(135°)',
      '서(180°)',
      '북서(225°)',
      '북(270°)',
      '북동(315°)',
    ];
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];

    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <p className="text-sm text-slate-600">
          8방향 에셋을 한 번에 확인합니다.
        </p>
        <div className="grid grid-cols-4 gap-4">
          {angles.map((angle, i) => (
            <div
              key={angle}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3"
            >
              <DuckSprite angle={angle} size={56} />
              <span className="text-xs text-slate-500">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '각도별 duck-walk 에셋이 올바르게 매핑되었는지 한눈에 확인합니다.',
      },
    },
  },
};
