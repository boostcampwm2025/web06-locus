import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { fn } from '@storybook/test';
import ImageUploadButton from './ImageUploadButton';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useToast } from '@/shared/ui/toast';

const meta = {
  title: 'Shared/UI/Form/ImageUploadButton',
  component: ImageUploadButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onFilesSelected: fn(),
  },
  argTypes: {
    label: {
      control: 'text',
      description: '섹션 라벨',
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
} satisfies Meta<typeof ImageUploadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledImageUploadButton(
  props: Omit<
    React.ComponentProps<typeof ImageUploadButton>,
    | 'onFilesSelected'
    | 'selectedImages'
    | 'previewUrls'
    | 'onRemoveImage'
    | 'isCompressing'
  >,
) {
  const { showToast } = useToast();
  const {
    selectedImages,
    previewUrls,
    isCompressing,
    handleFilesSelected,
    handleRemoveFile,
    cleanup,
  } = useImageUpload({
    maxFiles: props.maxFiles ?? 10,
    enableCompression: true,
    onFilesSelected: (files) => {
      showToast({
        variant: 'success',
        message: `${files.length}개의 이미지가 선택되었습니다.`,
      });
    },
    onValidationError: (error) => {
      showToast({
        variant: 'error',
        message: error.message,
      });
    },
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="w-full max-w-md">
      <ImageUploadButton
        {...props}
        onFilesSelected={handleFilesSelected}
        selectedImages={selectedImages}
        previewUrls={previewUrls}
        onRemoveImage={handleRemoveFile}
        isCompressing={isCompressing}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    label: '이미지',
    maxFiles: 10,
    disabled: false,
  },
  render: (args) => <ControlledImageUploadButton {...args} />,
};

function WithSelectedImagesContent(
  props: Omit<
    React.ComponentProps<typeof ImageUploadButton>,
    | 'onFilesSelected'
    | 'selectedImages'
    | 'previewUrls'
    | 'onRemoveImage'
    | 'isCompressing'
  >,
) {
  const { showToast } = useToast();
  const {
    selectedImages,
    previewUrls,
    isCompressing,
    handleFilesSelected,
    handleRemoveFile,
    cleanup,
  } = useImageUpload({
    maxFiles: props.maxFiles ?? 10,
    enableCompression: true,
    onFilesSelected: (files) => {
      showToast({
        variant: 'success',
        message: `${files.length}개의 이미지가 선택되었습니다.`,
      });
    },
    onValidationError: (error) => {
      showToast({
        variant: 'error',
        message: error.message,
      });
    },
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="w-full max-w-md space-y-4">
      <ImageUploadButton
        {...props}
        onFilesSelected={handleFilesSelected}
        selectedImages={selectedImages}
        previewUrls={previewUrls}
        onRemoveImage={handleRemoveFile}
        isCompressing={isCompressing}
      />
      {selectedImages.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            선택된 이미지 정보
          </p>
          <div className="space-y-1">
            {selectedImages.map((file, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 p-2 bg-white rounded"
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

export const WithSelectedImages: Story = {
  args: {
    label: '이미지',
    maxFiles: 10,
    disabled: false,
  },
  render: (args) => <WithSelectedImagesContent {...args} />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '이미지 선택 후 미리보기와 파일 정보를 표시합니다.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: '이미지',
    maxFiles: 10,
    disabled: true,
  },
  render: (args) => <ControlledImageUploadButton {...args} />,
};

export const MaxFiles3: Story = {
  args: {
    label: '이미지',
    maxFiles: 3,
    disabled: false,
  },
  render: (args) => <ControlledImageUploadButton {...args} />,
};

export const DesktopView: Story = {
  args: {
    label: '이미지',
    maxFiles: 10,
    disabled: false,
  },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <ControlledImageUploadButton {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: '데스크톱 환경에서는 드래그앤드롭 영역이 표시됩니다.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    label: '이미지',
    maxFiles: 10,
    disabled: false,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <ControlledImageUploadButton {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          '모바일 환경에서는 버튼 클릭으로 파일 선택 다이얼로그가 열립니다.',
      },
    },
  },
};
