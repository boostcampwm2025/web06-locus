import type { Meta, StoryObj } from '@storybook/react-vite';
import OAuthLoginPage from './OAuthLoginPage';

const meta = {
  title: 'Features/Auth/OAuthLoginPage',
  component: OAuthLoginPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OAuthLoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
};

export const Tablet: Story = {
  globals: {
    viewport: { value: 'tablet', isRotated: false },
  },
};

export const Desktop: Story = {
  globals: {
    viewport: { value: 'desktop', isRotated: false },
  },
};
