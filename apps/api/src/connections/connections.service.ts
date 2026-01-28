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
    userId: bigint,
    createConnectionDto: CreateConnectionRequestDto,
  ): Promise<ConnectionDto> {
    const { fromRecordPublicId, toRecordPublicId } = createConnectionDto;

    const [fromRecord, toRecord] = await this.getRecords(
      fromRecordPublicId,
      toRecordPublicId,
    );

    await this.validateConnection(fromRecord, toRecord, userId);

    const created = await this.prismaService.$transaction(async (tx) => {
      const createdConnection = await tx.connection.create({
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
      });

      await tx.connection.create({
        data: {
          userId,
          fromRecordId: toRecord.id,
          toRecordId: fromRecord.id,
        },
        select: { id: true },
      });

      await this.recordsService.incrementConnectionsCount(tx, fromRecord.id, 1);
      await this.recordsService.incrementConnectionsCount(tx, toRecord.id, 1);

      return createdConnection;
    });

    return {
      publicId: created.publicId,
      createdAt: created.createdAt.toISOString(),
      fromRecordPublicId: created.fromRecord.publicId,
      toRecordPublicId: created.toRecord.publicId,
    };
  }

  async delete(
    userId: bigint,
    publicId: string,
  ): Promise<DeletedConnectionDto> {
    const [findOne, findPair] = await this.findPairConnections(
      userId,
      publicId,
    );

    await this.prismaService.$transaction(async (tx) => {
      //양방향 연결 삭제
      await tx.connection.deleteMany({
        where: { id: { in: [findOne.id, findPair.id] } },
      });

      await this.recordsService.incrementConnectionsCount(
        tx,
        findOne.toRecordId,
        -1,
      );
      await this.recordsService.incrementConnectionsCount(
        tx,
        findOne.fromRecordId,
        -1,
      );
    });

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
    const [fromRecord, toRecord] = await Promise.all([
      this.recordsService.findOneByPublicId(fromRecordPublicId),
      this.recordsService.findOneByPublicId(toRecordPublicId),
    ]);
    return [fromRecord, toRecord];
  }

  private async validateConnection(
    fromRecord: { id: bigint; publicId: string; userId: bigint },
    toRecord: { id: bigint; publicId: string; userId: bigint },
    userId: bigint,
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

  private async findPairConnections(userId: bigint, publicId: string) {
    const findOne = await this.prismaService.connection.findFirst({
      where: { userId, publicId },
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
    });

    if (!findPair) {
      throw new PairConnectionNotFoundException(publicId);
    }
    return [findOne, findPair];
  }
}
