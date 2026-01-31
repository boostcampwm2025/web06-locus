import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { RecordModel, RecordModelWithoutCoords } from '../records.types';
import {
  COUNT_RECORDS_BY_LOCATION_SQL,
  COUNT_RECORDS_IN_BOUNDS_SQL,
  SELECT_RECORDS_BY_LOCATION_SQL,
  SELECT_RECORDS_IN_BOUNDS_SQL,
} from '../sql/record-raw.query';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecordQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecordsInBounds(
    userId: bigint,
    bounds: { swLng: number; swLat: number; neLng: number; neLat: number },
    pagination: { limit: number; offset: number },
    sortOrder: 'asc' | 'desc',
  ): Promise<{ records: RecordModel[]; totalCount: number }> {
    const [records, countResult] = await Promise.all([
      this.prisma.$queryRaw<RecordModel[]>(
        SELECT_RECORDS_IN_BOUNDS_SQL(
          userId,
          bounds.swLng,
          bounds.swLat,
          bounds.neLng,
          bounds.neLat,
          sortOrder,
          pagination.limit,
          pagination.offset,
        ),
      ),
      this.prisma.$queryRaw<[{ count: number }]>(
        COUNT_RECORDS_IN_BOUNDS_SQL(
          userId,
          bounds.swLng,
          bounds.swLat,
          bounds.neLng,
          bounds.neLat,
        ),
      ),
    ]);

    return { records, totalCount: countResult[0].count };
  }

  async getRecordsByLocation(
    userId: bigint,
    location: { latitude: number; longitude: number; radius: number },
    pagination: { limit: number; offset: number },
    sortOrder: 'asc' | 'desc',
  ): Promise<{ records: RecordModel[]; totalCount: number }> {
    const [records, countResult] = await Promise.all([
      this.prisma.$queryRaw<RecordModel[]>(
        SELECT_RECORDS_BY_LOCATION_SQL(
          userId,
          location.latitude,
          location.longitude,
          location.radius,
          sortOrder,
          pagination.limit,
          pagination.offset,
        ),
      ),
      this.prisma.$queryRaw<[{ count: number }]>(
        COUNT_RECORDS_BY_LOCATION_SQL(
          userId,
          location.latitude,
          location.longitude,
          location.radius,
        ),
      ),
    ]);

    return { records, totalCount: countResult[0].count };
  }

  async getAllRecords(
    userId: bigint,
    filters: {
      startDate?: Date;
      endDate?: Date;
      tagIds?: bigint[];
    },
    pagination: { limit: number; offset: number },
    sortOrder: 'asc' | 'desc',
  ): Promise<{ records: RecordModelWithoutCoords[]; totalCount: number }> {
    const { startDate, endDate, tagIds } = filters;

    const where: Prisma.RecordWhereInput = {
      userId,
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && {
        createdAt: { ...(startDate && { gte: startDate }), lt: endDate },
      }),
      ...(tagIds?.length && { tags: { some: { tagId: { in: tagIds } } } }),
    };

    const [records, totalCount] = await Promise.all([
      this.prisma.record.findMany({
        where,
        select: {
          id: true,
          publicId: true,
          title: true,
          content: true,
          locationName: true,
          locationAddress: true,
          isFavorite: true,
          createdAt: true,
          updatedAt: true,
          connectionsCount: true,
        },
        orderBy: { createdAt: sortOrder },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      this.prisma.record.count({ where }),
    ]);

    return { records, totalCount };
  }
}
