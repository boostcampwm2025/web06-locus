import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NaverMapResponse,
  ReverseGeocodingResult,
} from './type/reverse-geocoding.types';
import { GeocodingResult } from './type/geocoding.type';

const GEOCODE_API_URL = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';
const REVERSE_GEOCODE_API_URL =
  'https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
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

  private buildApiUrl(longitude: number, latitude: number): string {
    // Naver Map API는 경도, 위도 순서 (longitude, latitude)
    const coords = `${longitude},${latitude}`;

    return `${REVERSE_GEOCODE_API_URL}?coords=${coords}&orders=roadaddr&output=json`;
  }

  private async callNaverMapApi(url: string) {
    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      this.logger.warn(
        `Reverse geocoding failed: ${response.status} ${response.statusText}`,
      );
      throw new Error(`API call failed: ${response.status}`);
    }

    const raw: unknown = await response.json();

    // TODO: ZOD runtime validation 추가
    return raw;
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
}
