export interface RecordCreateBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  address: string;
  onConfirm: () => void;
}
