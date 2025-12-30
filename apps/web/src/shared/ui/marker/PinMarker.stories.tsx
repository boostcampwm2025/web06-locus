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
      description: '핀마커 데이터',
    },
    isSelected: {
      control: 'boolean',
      description: '선택 상태',
    },
    onClick: {
      action: 'pinClicked',
      description: '핀 클릭 시 호출되는 콜백',
    },
  },
} satisfies Meta<typeof PinMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 데이터
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

function InteractivePinMarkerDemo() {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  return (
    <div className="space-y-8 p-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          인터랙티브 핀마커
        </h3>
        <p className="text-sm text-gray-600">핀을 클릭하거나 hover 해보세요.</p>
        {selectedId && (
          <p className="text-sm text-blue-600 mt-2">
            선택된 핀 ID: {selectedId}
          </p>
        )}
      </div>

      <div className="flex gap-8 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <PinMarker
            pin={currentPin}
            isSelected={selectedId === currentPin.id}
            onClick={(id) => {
              setSelectedId(id);
            }}
          />
          <span className="text-xs text-gray-600">현재 위치</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <PinMarker
            pin={recordPin}
            isSelected={selectedId === recordPin.id}
            onClick={(id) => {
              setSelectedId(id);
            }}
          />
          <span className="text-xs text-gray-600">기록 완료</span>
        </div>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  args: {
    pin: currentPin,
    isSelected: false,
  },
  render: () => <InteractivePinMarkerDemo />,
};

export const States: Story = {
  args: {
    pin: currentPin,
    isSelected: false,
  },
  render: () => {
    return (
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-700">
              현재 위치 (Current)
            </h3>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col items-center gap-2">
                <PinMarker pin={currentPin} isSelected={false} />
                <span className="text-xs text-gray-500">
                  기본 상태 (pulse + glow 지속)
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <PinMarker pin={currentPin} isSelected={true} />
                <span className="text-xs text-gray-500">
                  선택 상태 (떠오르는 효과)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-700">
              기록 완료 (Record)
            </h3>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col items-center gap-2">
                <PinMarker pin={recordPin} isSelected={false} />
                <span className="text-xs text-gray-500">기본 상태 (정적)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <PinMarker pin={recordPin} isSelected={true} />
                <span className="text-xs text-gray-500">
                  선택 상태 (떠오르는 효과 + 스윕)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '모든 상태의 핀마커를 한눈에 비교할 수 있습니다.',
      },
    },
  },
};

export const Accessibility: Story = {
  args: {
    pin: currentPin,
    isSelected: false,
  },
  render: () => {
    return (
      <div className="space-y-6 p-8 max-w-2xl">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            접근성 기능
          </h3>
          <p className="text-sm text-gray-600">
            스크린 리더 지원이 포함되어 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              접근성 속성
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• role="button": 버튼 역할 명시</li>
              <li>• tabIndex={0}: 키보드 포커스 가능</li>
              <li>• aria-label: 핀마커 식별 정보 제공</li>
              <li>• aria-pressed: 선택 상태 표시</li>
            </ul>
          </div>

          <div className="flex gap-4 items-center justify-center">
            <PinMarker pin={currentPin} />
            <PinMarker pin={recordPin} />
          </div>

          <p className="text-xs text-gray-500 text-center">
            스크린 리더로 핀마커의 상태와 역할을 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '스크린 리더 지원 기능을 확인할 수 있습니다.',
      },
    },
  },
};
