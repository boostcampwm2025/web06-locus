import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import ConnectionNetworkView from './ConnectionNetworkView';
import type { GraphNode } from '@locus/shared';
import type { GraphEdgeResponse } from '@/infra/types/connection';

const meta = {
  title: 'Features/Connection/ConnectionNetworkView',
  component: ConnectionNetworkView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'D3 기반 연결 네트워크 시각화. 노드 클릭/드래그 가능. 기준 기록(baseRecordPublicId)은 초록색으로 표시.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onNodeClick: {
      action: 'node clicked',
      description: '노드 클릭 시 호출 (publicId 전달)',
    },
  },
} satisfies Meta<typeof ConnectionNetworkView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** GET /records/{publicId}/graph 응답과 동일한 형태의 mock */
const mockNodes: GraphNode[] = [
  { publicId: 'rec_base', location: { latitude: 37.52, longitude: 127.04 } },
  { publicId: 'rec_1', location: { latitude: 37.53, longitude: 127.05 } },
  { publicId: 'rec_2', location: { latitude: 37.51, longitude: 127.03 } },
  { publicId: 'rec_3', location: { latitude: 37.54, longitude: 127.04 } },
  { publicId: 'rec_4', location: { latitude: 37.52, longitude: 127.06 } },
];

const mockEdges: GraphEdgeResponse[] = [
  { fromRecordPublicId: 'rec_base', toRecordPublicId: 'rec_1' },
  { fromRecordPublicId: 'rec_base', toRecordPublicId: 'rec_2' },
  { fromRecordPublicId: 'rec_base', toRecordPublicId: 'rec_3' },
  { fromRecordPublicId: 'rec_base', toRecordPublicId: 'rec_4' },
];

/** 기본: 기준 기록(rec_base) 중심으로 4개 연결 */
export const Default: Story = {
  args: {
    nodes: mockNodes,
    edges: mockEdges,
    baseRecordPublicId: 'rec_base',
    width: 400,
    height: 300,
    onNodeClick: fn(),
  },
};
