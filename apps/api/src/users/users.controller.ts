import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../jwt/guard/jwt.auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // NOTE: 요 친구는 테스트용이라 추후 수정해야 해요!@!
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser('sub') userId: bigint) {
    const user = await this.usersService.findById(userId);
    // return user;
    return {
      ...user,
      id: user.id.toString(),
    };
  }
}
