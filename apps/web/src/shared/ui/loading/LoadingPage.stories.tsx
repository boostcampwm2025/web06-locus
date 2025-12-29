import type { Meta, StoryObj } from '@storybook/react-vite';
import LoadingPage from './LoadingPage';

const meta = {
    title: 'Shared/UI/LoadingPage',
    component: LoadingPage,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        version: {
            control: 'select',
            options: [1, 2, 3],
            description: '로딩 페이지 스타일 버전',
        },
    },
} satisfies Meta<typeof LoadingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Version1: Story = {
    args: {
        version: 1,
    },
};

export const Version2: Story = {
    args: {
        version: 2,
    },
};

export const Version3: Story = {
    args: {
        version: 3,
    },
};

/**
 * 모든 버전 비교
 * 세 가지 스타일을 한 번에 비교할 수 있습니다.
 */
export const AllVersions: Story = {
    render: () => (
        <div className="grid h-screen grid-cols-3 gap-0">
            <div className="relative">
                <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                    Version 1
                </div>
                <LoadingPage version={1} />
            </div>
            <div className="relative">
                <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                    Version 2
                </div>
                <LoadingPage version={2} />
            </div>
            <div className="relative">
                <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                    Version 3
                </div>
                <LoadingPage version={3} />
            </div>
        </div>
    ),
    parameters: {
        layout: 'fullscreen',
    },
};
