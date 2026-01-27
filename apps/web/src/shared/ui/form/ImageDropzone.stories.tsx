import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from '@storybook/test';
import ImageDropzone from './ImageDropzone';
import { useToast } from '@/shared/ui/toast';

const meta = {
  title: 'Shared/UI/Form/ImageDropzone',
  component: ImageDropzone,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onFilesSelected: fn(),
  },
  argTypes: {
    onFilesSelected: {
      description: '파일 선택 시 호출되는 콜백',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부',
    },
    maxFiles: {
      control: 'number',
      description: '최대 파일 개수',
    },
  },
} satisfies Meta<typeof ImageDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledImageDropzone(
  props: React.ComponentProps<typeof ImageDropzone>,
) {
  const [files, setFiles] = useState<File[]>([]);
  const { showToast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    showToast({
      variant: 'success',
      message: `${selectedFiles.length}개의 파일이 선택되었습니다.`,
    });
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <ImageDropzone {...props} onFilesSelected={handleFilesSelected} />
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            선택된 파일: {files.length}개
          </p>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="text-xs text-gray-500 p-2 bg-gray-50 rounded"
              >
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WithSelectedFilesContent(
  props: React.ComponentProps<typeof ImageDropzone>,
) {
  const [files, setFiles] = useState<File[]>([]);
  const { showToast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    showToast({
      variant: 'success',
      message: `${selectedFiles.length}개의 파일이 선택되었습니다.`,
    });
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <ImageDropzone {...props} onFilesSelected={handleFilesSelected} />
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900 mb-2">
            선택된 파일 ({files.length}개)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const Default: Story = {
  args: {
    maxFiles: 10,
    disabled: false,
  },
  render: (args) => <ControlledImageDropzone {...args} />,
};

export const Disabled: Story = {
  args: {
    maxFiles: 10,
    disabled: true,
  },
  render: (args) => <ControlledImageDropzone {...args} />,
};

export const MaxFiles3: Story = {
  args: {
    maxFiles: 3,
    disabled: false,
  },
  render: (args) => <ControlledImageDropzone {...args} />,
};

export const WithSelectedFiles: Story = {
  args: {
    maxFiles: 10,
    disabled: false,
  },
  render: (args) => <WithSelectedFilesContent {...args} />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '파일 선택 후 미리보기를 표시합니다.',
      },
    },
  },
};
