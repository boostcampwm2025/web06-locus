import type { Meta, StoryObj } from '@storybook/react';
import AppErrorBoundary from './ErrorBoundary';

// 에러를 발생시키는 테스트 컴포넌트
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) {
        throw new Error('테스트 에러입니다!');
    }
    return <div className="p-4 bg-green-100 rounded">정상 작동 중</div>;
}

const meta = {
    title: 'Shared/UI/ErrorBoundary',
    component: AppErrorBoundary,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof AppErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <div className="p-8">
                <h1 className="text-2xl mb-4">정상 작동 중</h1>
                <p>에러가 발생하지 않으면 이 화면이 보입니다.</p>
            </div>
        ),
    },
};

export const WithError: Story = {
    args: {
        children: <ThrowError shouldThrow={true} />,
    },
};
