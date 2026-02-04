import { ApiTags } from '@nestjs/swagger';
import { DuckService } from './duck.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { DuckCommentSwagger } from './swagger/ducks.swagger';
import { DuckCommentResponseDto } from './dto/duck-comment-response.dto';

@ApiTags('duck')
@Controller('duck')
export class DuckController {
  constructor(private readonly duckService: DuckService) {}

  @Get('comments')
  @UseGuards(JwtAuthGuard)
  @DuckCommentSwagger()
  async getComments(
    @CurrentUser('sub') userId: bigint,
  ): Promise<DuckCommentResponseDto> {
    return await this.duckService.getComments(userId);
  }
}
