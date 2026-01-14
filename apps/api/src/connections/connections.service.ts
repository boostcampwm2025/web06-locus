import { Injectable } from '@nestjs/common';
import { CreateConnectionRequestDto } from './dto/create-connection.request.dto';
import {
  ConnectionAlreadyExistsException,
  PairConnectionNotFoundException,
  SameRecordConnectionNotAllowedException,
} from './exceptions/business.exception';
import { PrismaService } from '@/prisma/prisma.service';
import { DeletedConnectionDto } from './dto/delete-connection.response.dto';
import { ConnectionDto } from './dto/create-connection.response.dto';
import { RecordNotFoundException } from '@/records/exceptions/record.exceptions';
import { RecordsService } from '@/records/records.service';

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly recordsService: RecordsService,
  ) {}

  async create(
    userId: number,
    createConnectionDto: CreateConnectionRequestDto,
  ): Promise<ConnectionDto> {
    const { fromRecordPublicId, toRecordPublicId } = createConnectionDto;

    const [fromRecord, toRecord] = await this.getRecords(
      fromRecordPublicId,
      toRecordPublicId,
    );

    await this.validateConnection(fromRecord, toRecord, userId);

    const [created] = await this.prismaService.$transaction([
      this.prismaService.connection.create({
        data: {
          userId,
          fromRecordId: fromRecord.id,
          toRecordId: toRecord.id,
        },
        select: {
          publicId: true,
          createdAt: true,
          fromRecord: { select: { publicId: true } },
          toRecord: { select: { publicId: true } },
        },
      }),
      this.prismaService.connection.create({
        data: {
          userId,
          fromRecordId: toRecord.id,
          toRecordId: fromRecord.id,
        },
        select: { id: true }, // 두 번째는 반환 최소화
      }),
    ]);

    return {
      publicId: created.publicId,
      createdAt: created.createdAt.toISOString(),
      fromRecordPublicId: created.fromRecord.publicId,
      toRecordPublicId: created.toRecord.publicId,
    };
  }

  async delete(
    userId: number,
    publicId: string,
  ): Promise<DeletedConnectionDto> {
    const [findOne, findPair] = await this.findPairConnections(
      userId,
      publicId,
    );

    await this.prismaService.$transaction([
      this.prismaService.connection.delete({
        where: { id: findOne.id },
      }),
      this.prismaService.connection.delete({
        where: { id: findPair.id },
      }),
    ]);

    return {
      publicId: findOne.publicId,
      pairPublicId: findPair.publicId,
    };
  }

  private async getRecords(
    fromRecordPublicId: string,
    toRecordPublicId: string,
  ) {
    if (fromRecordPublicId === toRecordPublicId) {
      throw new SameRecordConnectionNotAllowedException(fromRecordPublicId);
    }
    const fromRecord =
      await this.recordsService.findOneByPublicId(fromRecordPublicId);
    const toRecord =
      await this.recordsService.findOneByPublicId(toRecordPublicId);

    return [fromRecord, toRecord];
  }

  private async validateConnection(
    fromRecord: { id: bigint; publicId: string; userId: number },
    toRecord: { id: bigint; publicId: string; userId: number },
    userId: number,
  ) {
    //연결 검증
    // (A,B) 또는 (B,A) 중 하나라도 있으면 중복
    const existing = await this.prismaService.connection.findFirst({
      where: {
        userId,
        OR: [
          { fromRecordId: fromRecord.id, toRecordId: toRecord.id },
          { fromRecordId: toRecord.id, toRecordId: fromRecord.id },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConnectionAlreadyExistsException(
        fromRecord.publicId,
        toRecord.publicId,
      );
    }
  }

  private async findPairConnections(userId: number, publicId: string) {
    const findOne = await this.prismaService.connection.findFirst({
      where: { userId, publicId },
      select: {
        id: true,
        fromRecordId: true,
        toRecordId: true,
        publicId: true,
      },
    });

    if (!findOne) {
      throw new RecordNotFoundException(publicId);
    }

    const findPair = await this.prismaService.connection.findFirst({
      where: {
        userId,
        fromRecordId: findOne.toRecordId,
        toRecordId: findOne.fromRecordId,
      },
      select: { id: true, publicId: true },
    });

    if (!findPair) {
      throw new PairConnectionNotFoundException(publicId);
    }
    return [findOne, findPair];
  }
}
