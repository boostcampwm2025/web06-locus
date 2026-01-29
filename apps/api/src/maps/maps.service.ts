import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NaverMapResponse,
  ReverseGeocodingResult,
} from './type/reverse-geocoding.types';
import { GeocodingResult } from './type/geocoding.type';
import { SearchAddressResponseDto } from './dto/search-address.response.dto';

const GEOCODE_API_URL = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';
const REVERSE_GEOCODE_API_URL =
  'https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc';
const NAVER_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json';

interface NaverLocalSearchResponse {
  total: number;
  items: {
    title: string;
    address: string;
    roadAddress: string;
    mapx: string;
    mapy: string;
  }[];
}

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly NAVER_MAP_CLIENT_ID: string;
  private readonly NAVER_MAP_CLIENT_SECRET: string;
  private readonly NAVER_SEARCH_CLIENT_ID: string;
  private readonly NAVER_SEARCH_CLIENT_SECRTE: string;

  constructor(private configService: ConfigService) {
    this.NAVER_MAP_CLIENT_ID = this.configService.getOrThrow<string>(
      'NAVER_MAP_CLIENT_ID',
    );
    this.NAVER_MAP_CLIENT_SECRET = this.configService.getOrThrow<string>(
      'NAVER_MAP_CLIENT_SECRET',
    );

    this.NAVER_SEARCH_CLIENT_ID =
      this.configService.getOrThrow<string>('NAVER_CLIENT_ID');

    this.NAVER_SEARCH_CLIENT_SECRTE = this.configService.getOrThrow<string>(
      'NAVER_CLIENT_SECRET',
    );
  }

  async getAddressFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodingResult> {
    try {
      const url = this.buildApiUrl(longitude, latitude);
      const data = (await this.callNaverMapApi(url)) as NaverMapResponse;

      if (!this.isValidResponse(data)) {
        this.logger.warn(
          `No results from Naver Map API: ${data.status.message}`,
        );

        return { name: null, address: null };
      }

      const result = data.results[0];
      const name = this.extractLocationName(result.land);
      const address = this.extractAddress(result.region, result.land);

      return { name, address };
    } catch (error: unknown) {
      this.logger.error(
        `Non-Error exception thrown during get Address from coordinates: latitude=${latitude}, longitude=${longitude}, raw=${JSON.stringify(error)}`,
      );
      return { name: null, address: null };
    }
  }

  async getCoordinatesFromAddress(address: string): Promise<GeocodingResult> {
    const qs = new URLSearchParams({ query: address });
    const url = `${GEOCODE_API_URL}?${qs.toString()}`;
    const result = (await this.callNaverMapApi(url)) as GeocodingResult;

    return result;
  }

  async searchAddress(address: string): Promise<SearchAddressResponseDto> {
    const qs = new URLSearchParams({ query: address });
    const url = `${NAVER_SEARCH_API_URL}?${qs.toString()}&display=5&sort=random`; // 정확도 순 내림차 순으로 5개 최대 요청

    const result = (await this.callNaverOpenApi(
      url,
    )) as NaverLocalSearchResponse;

    return {
      meta: { totalCount: result.total },
      addresses: result.items.map((item) => ({
        title: item.title,
        roadAddress: item.roadAddress,
        jibunAddress: item.address,
        latitude: this.convertSearchCoordinate(item.mapy),
        longitude: this.convertSearchCoordinate(item.mapx),
      })),
    };
  }

  private buildApiUrl(longitude: number, latitude: number): string {
    // Naver Map API는 경도, 위도 순서 (longitude, latitude)
    const coords = `${longitude},${latitude}`;

    return `${REVERSE_GEOCODE_API_URL}?coords=${coords}&orders=roadaddr&output=json`;
  }

  private async callNaverMapApi(url: string) {
    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.NAVER_MAP_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': this.NAVER_MAP_CLIENT_SECRET,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      this.logger.warn(
        `Naver Map API request failed: ${response.status} ${response.statusText}`,
      );
      throw new Error(`API call failed: ${response.status}`);
    }

    const raw: unknown = await response.json();

    // TODO: ZOD runtime validation 추가
    return raw;
  }

  private async callNaverOpenApi(url: string) {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': this.NAVER_SEARCH_CLIENT_ID,
        'X-Naver-Client-Secret': this.NAVER_SEARCH_CLIENT_SECRTE,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.warn(
        `Naver API request fail: url [${url}] ${response.status} ${response.statusText} body:${body}`,
      );
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json() as Promise<unknown>;
  }

  private isValidResponse(data: NaverMapResponse): boolean {
    return (
      data.status.code === 0 &&
      data.results !== undefined &&
      data.results.length > 0
    );
  }

  private extractLocationName(
    land: NaverMapResponse['results'][0]['land'],
  ): string | null {
    const name = land.addition0.value || null;

    return name?.trim() ?? null;
  }

  private extractAddress(
    region: NaverMapResponse['results'][0]['region'],
    land: NaverMapResponse['results'][0]['land'],
  ): string | null {
    let address = ``;

    Object.values(region)
      .slice(1)
      .forEach((area) => {
        if (area.name) address += ` ${area.name}`;
      });

    const number = land.number2
      ? `${land.number1}-${land.number2}`
      : land.number1;

    address += ` ${number}`;

    return address.trim() || null;
  }

  private convertSearchCoordinate(value: string): string {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return '';
    }
    return (numeric / 1e7).toFixed(7);
  }
}
