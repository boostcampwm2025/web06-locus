import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const customViewports = {
  mobile1: {
    name: 'Mobile',
    styles: { width: '375px', height: '812px' },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet',
  },
  desktop: {
    name: 'Desktop',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop',
  },
};

const preview: Preview = {
  parameters: {
    viewport: {
      options: customViewports,
    },
  },
};

export default preview;
