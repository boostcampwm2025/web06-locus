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
  onClick: () => void;
  className?: string;
}
