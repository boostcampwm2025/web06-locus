import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import ConnectionHeader from './ConnectionHeader';
import ConnectionConfirmDialog from './ConnectionConfirmDialog';

const meta = {
  title: 'Features/Connection/Desktop/RecordConnectionDrawer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '데스크톱용 연결 플로우 컴포넌트들. 상단 고정 헤더와 연결 확인 다이얼로그로 구성됩니다.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

/**
 * 연결 헤더
 * 상단에 고정되어 기준 기록과 연결할 기록 선택 안내를 표시합니다.
 */
export const ConnectionHeaderStory: StoryObj = {
  render: () => {
    return (
      <div className="h-screen bg-[#FDFCFB] relative">
        <ConnectionHeader
          fromRecord={{
            id: 'record-1',
            title: '한옥마을 방문',
            location: {
              name: '북촌',
              address: '서울특별시 종로구 계동길',
            },
          }}
          onCancel={fn()}
        />
        <div className="p-8">
          <p className="text-gray-500">
            연결 모드 헤더가 상단에 고정되어 표시됩니다.
          </p>
        </div>
      </div>
    );
  },
};

/**
 * 연결 확인 다이얼로그
 * 출발 기록과 도착 기록을 확인하고 연결을 최종 확인할 수 있습니다.
 */
export const ConnectionConfirmDialogStory: StoryObj = {
  render: () => {
    const ConnectionConfirmDialogComponent = () => {
      const [isOpen, setIsOpen] = useState(true);
      const [isConnecting, setIsConnecting] = useState(false);

      return (
        <div className="h-screen bg-[#FDFCFB]">
          <div className="p-8">
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              다이얼로그 열기
            </button>
          </div>
          <ConnectionConfirmDialog
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            departure={{
              id: 'record-1',
              title: '한옥마을 방문',
              location: {
                name: '북촌',
                address: '서울특별시 종로구 계동길',
              },
              imageUrl:
                'https://images.unsplash.com/photo-1655910843284-68e2a2f37f47?q=80&w=600',
            }}
            arrival={{
              id: 'record-2',
              title: '강남 카페거리',
              location: {
                name: '강남역',
                address: '서울특별시 강남구 강남대로',
              },
              imageUrl:
                'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=600',
            }}
            onConfirm={() => {
              void (async () => {
                setIsConnecting(true);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                setIsConnecting(false);
                setIsOpen(false);
              })();
            }}
            isConnecting={isConnecting}
          />
        </div>
      );
    };
    return <ConnectionConfirmDialogComponent />;
  },
};
