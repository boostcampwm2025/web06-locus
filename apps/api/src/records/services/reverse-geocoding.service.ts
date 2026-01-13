import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ReverseGeocodingResult {
  name: string | null;
  address: string | null;
}

interface NaverMapResponse {
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

@Injectable()
export class ReverseGeocodingService {
  private readonly logger = new Logger(ReverseGeocodingService.name);
  private readonly apiUrl =
    'https://maps.apigw.ntruss.com/map-reversegeocode/v2';
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.getOrThrow<string>(
      'NAVER_MAP_CLIENT_ID',
    );
    this.clientSecret = this.configService.getOrThrow<string>(
      'NAVER_MAP_CLIENT_SECRET',
    );
  }

  async getAddressFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodingResult> {
    try {
      // Naver Map API는 경도, 위도 순서 (longitude, latitude)
      const coords = `${longitude},${latitude}`;
      const url = `${this.apiUrl}?coords=${coords}&orders=roadaddr&output=json`;

      const response = await fetch(url, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.clientId,
          'X-NCP-APIGW-API-KEY': this.clientSecret,
        },
      });

      if (!response.ok) {
        this.logger.warn(
          `Reverse geocoding failed: ${response.status} ${response.statusText}`,
        );
        return { name: null, address: null };
      }

      // TODO: Zod schema 도입 후 제거 필요
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: NaverMapResponse = await response.json();

      if (
        data.status.code !== 0 ||
        !data.results ||
        data.results.length === 0
      ) {
        this.logger.warn(
          `No results from Naver Map API: ${data.status.message}`,
        );
        return { name: null, address: null };
      }

      const result = data.results[0];
      const region = result.region;
      const land = result.land;

      // 장소 이름: 읍면동 또는 area4 (리)
      const name = region.area3.name || region.area4.name || null;

      // 주소: 시도 + 시군구 + 읍면동 + 지번
      let address = `${region.area1.name} ${region.area2.name} ${region.area3.name}`;
      if (land) {
        const number = land.number2
          ? `${land.number1}-${land.number2}`
          : land.number1;
        address += ` ${land.name} ${number}`;
      }

      return {
        name: name?.trim() ?? null,
        address: address.trim() || null,
      };
    } catch (error: unknown) {
      // TODO: Zod로 구조/네트워크 에러 구분 추가
      if (error instanceof Error) {
        this.logger.error(
          `Reverse geocoding error: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Reverse geocoding unknown error`, String(error));
      }
      return { name: null, address: null };
    }
  }
}
