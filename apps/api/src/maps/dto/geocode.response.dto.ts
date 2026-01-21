export class GeocodeResponseDto {
  meta: { totalCount: number; page: number; count: number };
  addresses: AddressDataDto[];
}

export interface AddressDataDto {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  latitude: string;
  longitude: string;
}
