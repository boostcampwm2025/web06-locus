import type { Meta, StoryObj } from '@storybook/react';
import ErrorIcon from './ErrorIcon';

const meta = {
    title: 'Shared/Icons/ErrorIcon',
    component: ErrorIcon,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        className: {
            control: 'text',
            description: 'Tailwind CSS classes for styling (size, color, etc.)',
        },
    },
} satisfies Meta<typeof ErrorIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const WithDifferentColors: Story = {
    render: () => (
        <div className="flex gap-4 items-center">
            <ErrorIcon className="w-8 h-8 text-red-500" />
            <ErrorIcon className="w-8 h-8 text-orange-500" />
            <ErrorIcon className="w-8 h-8 text-yellow-500" />
            <ErrorIcon className="w-8 h-8 text-gray-500" />
        </div>
    ),
};

export const InContext: Story = {
    render: () => (
        <div className="flex flex-col items-center gap-4 p-8 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 border-gray-300 flex items-center justify-center bg-white">
                <ErrorIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    일시적인 문제가 발생했어요
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    잠시 후 다시 시도해 주세요
                </p>
            </div>
        </div>
    ),
};
