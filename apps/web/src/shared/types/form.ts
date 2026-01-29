export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minHeight?: string;
  required?: boolean;
  className?: string;
}

export interface ImageUploadButtonProps {
  label: string;
  onFilesSelected: (files: File[]) => void | Promise<void>;
  selectedImages?: File[];
  previewUrls?: string[];
  onRemoveImage?: (index: number) => void;
  disabled?: boolean;
  maxFiles?: number;
  isCompressing?: boolean;
  className?: string;
  /** 모바일에서 "이미지 추가" 버튼 클릭 시 호출. */
  onMobileAddClick?: () => void;
}

export interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void | Promise<void>;
  disabled?: boolean;
  maxFiles?: number;
  currentCount?: number /** 현재 선택된 이미지 개수 (안내 메시지용) */;
  isCompressing?: boolean /** 압축 중인지 여부 */;
  className?: string;
}

export interface FormInputFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'label' | 'className'
  > {
  label: React.ReactNode;
  labelClassName?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
}
