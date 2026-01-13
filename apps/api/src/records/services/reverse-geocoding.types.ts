export interface ReverseGeocodingResult {
  name: string | null;
  address: string | null;
}

export interface NaverMapResponse {
  status: {
    code: number;
    name: string;
    message: string;
  };
  results: {
    region: {
      area1: { name: string }; // 시도
      area2: { name: string }; // 시군구
      area3: { name: string }; // 읍면동
      area4: { name: string }; // 리
    };
    land?: {
      name: string; // 지번 주소
      number1: string;
      number2: string;
    };
  }[];
}
