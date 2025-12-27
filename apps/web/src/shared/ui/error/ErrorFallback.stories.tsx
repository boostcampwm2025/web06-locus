import type { Meta, StoryObj } from '@storybook/react';
import ErrorFallback from './ErrorFallback';

const meta = {
    title: 'Shared/UI/ErrorFallback',
    component: ErrorFallback,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        error: {
            control: false,
            description: '발생한 에러 객체',
        },
        resetErrorBoundary: {
            action: 'resetErrorBoundary',
            description: '에러 바운더리를 리셋하는 함수',
        },
    },
} satisfies Meta<typeof ErrorFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        error: new Error('테스트 에러입니다'),
        resetErrorBoundary: () => {
            console.log('에러 바운더리 리셋');
        },
    },
};

export const WithCustomError: Story = {
    args: {
        error: new Error('네트워크 연결에 실패했습니다'),
        resetErrorBoundary: () => {
            console.log('에러 바운더리 리셋');
        },
    },
};

export const WithLongErrorMessage: Story = {
    args: {
        error: new Error(
            '매우 긴 에러 메시지입니다. 이 메시지는 사용자에게 표시되지 않지만 개발 환경에서는 확인할 수 있습니다.',
        ),
        resetErrorBoundary: () => {
            console.log('에러 바운더리 리셋');
        },
    },
};
