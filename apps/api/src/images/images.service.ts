import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}
  async findManyByRecordIds(recordIds: bigint[]) {
    return await this.prisma.image.findMany({
      where: { recordId: { in: recordIds } },
      orderBy: { order: 'asc' },
      select: {
        recordId: true,
        publicId: true,
        order: true,
        thumbnailUrl: true,
        thumbnailWidth: true,
        thumbnailHeight: true,
        thumbnailSize: true,
        mediumUrl: true,
        mediumWidth: true,
        mediumHeight: true,
        mediumSize: true,
        originalUrl: true,
        originalWidth: true,
        originalHeight: true,
        originalSize: true,
      },
    });
  }

  async getThumbnailsByRecordIds(recordIds: bigint[]) {
    return await this.prisma.image.findMany({
      where: { recordId: { in: recordIds } },
      distinct: ['recordId'],
      orderBy: { order: 'asc' },
      select: {
        recordId: true,
        publicId: true,
        thumbnailUrl: true,
        thumbnailWidth: true,
        thumbnailHeight: true,
        thumbnailSize: true,
      },
    });
  }
}
