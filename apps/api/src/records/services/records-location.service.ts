import { MapsService } from '@/maps/maps.service';
import { Injectable } from '@nestjs/common';
import { LocationInfo, RecordModel } from '../records.types';
import { Prisma, Record } from '@prisma/client';
import {
  GET_RECORD_LOCATION_SQL,
  UPDATE_RECORD_LOCATION_SQL,
} from '../sql/record-raw.query';
import { LocationNotFoundException } from '../exceptions/record.exceptions';

@Injectable()
export class RecordLocationService {
  constructor(private readonly mapsService: MapsService) {}

  async getLocationInfo(
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo> {
    const { name, address } = await this.mapsService.getAddressFromCoordinates(
      latitude,
      longitude,
    );
    return { name, address };
  }

  async updateRecordLocation(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    longitude: number,
    latitude: number,
  ): Promise<RecordModel> {
    const [updated] = await tx.$queryRaw<RecordModel[]>(
      UPDATE_RECORD_LOCATION_SQL(recordId, longitude, latitude),
    );
    return updated;
  }

  async getRecordWithLocation(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    record: Record,
  ): Promise<RecordModel> {
    const locations = await tx.$queryRaw<
      { longitude: number; latitude: number }[]
    >(GET_RECORD_LOCATION_SQL(recordId));

    const locationData = locations[0];
    if (!locationData) {
      throw new LocationNotFoundException(record.publicId);
    }

    const { userId: _, ...rest } = record;

    return {
      ...rest,
      longitude: locationData.longitude,
      latitude: locationData.latitude,
    } as RecordModel;
  }
}
