import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateTagRequestDto } from './dto/create-tag.request.dto';
import { TagsService } from './tags.services';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
@Controller('tags')
export class TagsController {
  constructor(private readonly tagService: TagsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser('sub') userId: bigint,
    @Body() requestDto: CreateTagRequestDto,
  ) {
    const result = await this.tagService.createOne(userId, requestDto);

    return { tag: { ...result, id: result.id.toString() } };
  }
}
