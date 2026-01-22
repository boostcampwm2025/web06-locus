import { Injectable } from '@nestjs/common';
import { CreateTagRequestDto } from './dto/create-tag.request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  InvalidTagNameException,
  SystemTagNotDeletableException,
  TagAlreadyExistsException,
  TagForbiddenException,
  TagNotFoundException,
} from './exception/tags.exception';
import { TagDto } from './dto/tags.response.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createOne(
    userId: bigint,
    requestDto: CreateTagRequestDto,
  ): Promise<{ publicId: string; name: string; isSystem: boolean }> {
    await this.validateTagName(userId, requestDto.name);

    const created = await this.prismaService.tag.create({
      data: {
        name: requestDto.name,
        isSystem: false,
        userId: userId,
      },
      select: {
        publicId: true,
        name: true,
        isSystem: true,
      },
    });

    return created;
  }

  async findByName(userId: bigint, name: string) {
    return await this.prismaService.tag.findFirst({
      where: {
        userId: userId,
        name: name,
      },
    });
  }

  async findByPublicId(userId: bigint, publicId: string) {
    return await this.prismaService.tag.findFirst({
      where: {
        userId: userId,
        publicId: publicId,
      },
    });
  }

  async deleteOne(userId: bigint, publicId: string) {
    const tag = await this.findByPublicId(userId, publicId);

    if (tag === null) {
      throw new TagNotFoundException(publicId);
    }

    if (tag.userId !== userId) {
      throw new TagForbiddenException(publicId);
    }

    if (tag.isSystem) {
      throw new SystemTagNotDeletableException(publicId);
    }

    return await this.prismaService.tag.delete({
      where: {
        id: tag.id,
      },
      select: {
        publicId: true,
      },
    });
  }

  async findAll(userId: bigint): Promise<TagDto[]> {
    return await this.prismaService.tag.findMany({
      where: {
        userId: userId,
      },
      select: {
        publicId: true,
        isSystem: true,
        name: true,
      },
    });
  }

  private async validateTagName(userId: bigint, name: string) {
    if (name.length === 0) {
      throw new InvalidTagNameException(name);
    }

    if (name.length > 5) {
      throw new InvalidTagNameException(name);
    }

    if ((await this.findByName(userId, name)) !== null) {
      throw new TagAlreadyExistsException(name);
    }
  }
}
