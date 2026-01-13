import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordModel } from './records.types';

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

    // 2. INSERT 후 record.id만 반환
    const [inserted] = await this.prisma.$queryRaw<{ id: number }[]>`
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
      RETURNING id
    `;

    // 3. 사용자 public_id 포함되도록 JOIN 조회
    const [record] = await this.prisma.$queryRaw<RecordModel[]>`
      SELECT
        r.id,
        r.public_id,
        u.public_id AS user_public_id,
        r.title,
        r.content,
        ST_X(r.location) AS longitude,
        ST_Y(r.location) AS latitude,
        r.location_name,
        r.location_address,
        r.tags,
        r.is_favorite,
        r.created_at,
        r.updated_at
      FROM records r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${inserted.id}
      LIMIT 1
    `;

    // 4. 응답 변환
    return this.toResponseDto(record);
  }

  private toResponseDto(record: RecordModel): RecordResponseDto {
    return {
      public_id: record.public_id,
      user_id: record.user_public_id,
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
