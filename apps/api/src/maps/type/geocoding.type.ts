export interface GeocodingResult {
  meta: { totalCount: number; page: number; count: number };
  addresses: AddressData[];
}

export interface AddressData {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  y: string;
  x: string;
}
