import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import PinMarker from './PinMarker';
import type { PinMarkerData } from '@/shared/types/marker';

const meta = {
  title: 'Shared/UI/Marker/PinMarker',
  component: PinMarker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    pin: {
      control: 'object',
      description: '핀마커 데이터 (id, position, variant)',
    },
    isSelected: {
      control: 'boolean',
      description: '선택 상태 (선택 애니메이션/스윕 표시)',
    },
    onClick: {
      action: 'pinClicked',
      description: '핀 클릭 시 호출되는 콜백 (pin.id 전달)',
    },
  },
  args: {
    isSelected: false,
  },
} satisfies Meta<typeof PinMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 샘플 데이터 */
const currentPin: PinMarkerData = {
  id: 'current-1',
  position: { lat: 37.5665, lng: 126.978 },
  variant: 'current',
};

const recordPin: PinMarkerData = {
  id: 'record-1',
  position: { lat: 37.5651, lng: 126.9895 },
  variant: 'record',
};

export const Interactive: Story = {
  name: 'Interactive (부모 상태로 선택 관리)',
  args: {
    pin: currentPin,
  },
  render: () => {
    function InteractiveDemo() {
      const [selectedId, setSelectedId] = useState<string | number | null>(
        null,
      );

      return (
        <div className="space-y-6 p-8">
          <div className="text-center space-y-1">
            <div className="text-sm font-semibold text-gray-800">
              Interactive Demo
            </div>
            <div className="text-xs text-gray-500">
              핀을 클릭하면 선택 상태가 전환됩니다.
            </div>
            {selectedId != null && (
              <div className="text-xs text-blue-600">
                선택된 핀: {selectedId}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <PinMarker
                pin={currentPin}
                isSelected={selectedId === currentPin.id}
                onClick={(id) => {
                  setSelectedId(id);
                }}
              />
              <span className="text-xs text-gray-500">current</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <PinMarker
                pin={recordPin}
                isSelected={selectedId === recordPin.id}
                onClick={(id) => {
                  setSelectedId(id);
                }}
              />
              <span className="text-xs text-gray-500">record</span>
            </div>
          </div>
        </div>
      );
    }

    return <InteractiveDemo />;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '실제 사용 패턴(부모에서 selectedId 관리)을 시연합니다. onClick으로 pin.id를 받아 선택 상태를 전환합니다.',
      },
    },
  },
};

/**
 * 접근성 노트(현재 컴포넌트 기준)
 * - role/button + tabIndex + aria-label + aria-pressed 제공
 */
export const AccessibilityNotes: Story = {
  name: 'Accessibility Notes',
  args: {
    pin: currentPin,
  },
  render: () => (
    <div className="space-y-4 p-8 max-w-xl">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-gray-800">접근성 메모</div>
        <div className="text-xs text-gray-500">
          현재 컴포넌트에 포함된 접근성 속성 요약입니다.
        </div>
      </div>

      <ul className="text-xs text-gray-600 space-y-1">
        <li>• role="button"</li>
        <li>• tabIndex=0</li>
        <li>• aria-label (핀마커 ID 포함)</li>
        <li>• aria-pressed (선택 상태)</li>
      </ul>

      <div className="flex items-center justify-center gap-8 pt-2">
        <PinMarker pin={currentPin} />
        <PinMarker pin={recordPin} isSelected />
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '현재 제공하는 접근성 속성들을 요약합니다.',
      },
    },
  },
};
