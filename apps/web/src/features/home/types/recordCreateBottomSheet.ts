export interface RecordCreateBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  onConfirm: () => void;
}
