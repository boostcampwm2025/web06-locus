import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordModel } from './records.types';
import { RecordCreationFailedException } from './exceptions/record.exceptions';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reverseGeocodingService: ReverseGeocodingService,
  ) {}

  async createRecord(
    userId: number,
    dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    // 1. 역지오코딩 호출
    const { name, address } =
      await this.reverseGeocodingService.getAddressFromCoordinates(
        dto.location.latitude,
        dto.location.longitude,
      );

    if (!name && !address) {
      this.logger.warn(
        `Reverse geocoding failed: lat=${dto.location.latitude}, lng=${dto.location.longitude}`,
      );
    }

    // 2. INSERT 후 생성된 기록 반환
    try {
      const [record] = await this.prisma.$queryRaw<RecordModel[]>`
        INSERT INTO records (
          user_id,
          title,
          content,
          location,
          location_name,
          location_address,
          tags,
          is_favorite,
          created_at,
          updated_at
        )
        VALUES (
          ${userId},
          ${dto.title},
          ${dto.content ?? null},
          ST_GeomFromText(${`POINT(${dto.location.longitude} ${dto.location.latitude})`}, 4326),
          ${name},
          ${address},
          ${dto.tags ?? []},
          false,
          NOW(),
          NOW()
        )
        RETURNING
          id,
          public_id,
          title,
          content,
          ST_X(location) AS longitude,
          ST_Y(location) AS latitude,
          location_name,
          location_address,
          tags,
          is_favorite,
          created_at,
          updated_at
      `;

      this.logger.log(
        `Record created: publicId=${record.public_id}, userId=${userId}, title="${dto.title}"`,
      );

      // 3. 응답 변환
      return this.toResponseDto(record);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create record: userId=${userId}, error=${error.message}`,
          error.stack,
        );
        throw new RecordCreationFailedException(error);
      } else {
        this.logger.error(
          `Non-Error exception thrown during record creation: userId=${userId}, raw=${JSON.stringify(error)}`,
        );
        throw new Error('Unexpected non-Error exception thrown');
      }
    }
  }

  private toResponseDto(record: RecordModel): RecordResponseDto {
    return {
      public_id: record.public_id,
      title: record.title,
      content: record.content,
      location: {
        latitude: record.latitude,
        longitude: record.longitude,
        name: record.location_name,
        address: record.location_address,
      },
      // TODO: 태그 관련 중간테이블 및 서비스 추가
      tags: record.tags,
      // TODO: 이미지 기능 추가
      images: [],
      is_favorite: record.is_favorite,
      created_at: record.created_at.toISOString(),
      updated_at: record.updated_at.toISOString(),
    };
  }
}
