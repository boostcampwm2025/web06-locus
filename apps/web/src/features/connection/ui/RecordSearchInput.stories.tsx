import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import RecordSearchInput from './RecordSearchInput';

const meta = {
  title: 'Features/Connection/RecordSearchInput',
  component: RecordSearchInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {
      action: 'value changed',
      description: '검색 입력값 변경 핸들러',
    },
  },
} satisfies Meta<typeof RecordSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {
      /* empty */
    },
    placeholder: '기록 제목, 태그, 장소 검색...',
  },
  parameters: {
    docs: {
      description: {
        story: '기본 검색 입력창',
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    value: '남산',
    onChange: () => {
      /* empty */
    },
    placeholder: '기록 제목, 태그, 장소 검색...',
  },
  parameters: {
    docs: {
      description: {
        story: '입력값이 있는 검색 입력창',
      },
    },
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    onChange: () => {
      /* empty */
    },
    placeholder: '검색어를 입력하세요...',
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 placeholder가 있는 검색 입력창',
      },
    },
  },
};

function InteractiveSearchInput() {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      <RecordSearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="기록 제목, 태그, 장소 검색..."
      />
      <div className="text-sm text-gray-500">
        입력값:{' '}
        <span className="font-medium text-gray-900">{value || '(없음)'}</span>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  args: {
    value: '',
    onChange: () => {
      /* empty */
    },
  },
  render: () => <InteractiveSearchInput />,
  parameters: {
    docs: {
      description: {
        story:
          '검색어를 입력하면 실시간으로 값이 업데이트됩니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};
