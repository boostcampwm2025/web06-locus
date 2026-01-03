import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // upsert
  async findOrCreateOAuthUser(
    email: string,
    nickname: string | null,
    profileImageUrl: string | null,
    provider: Provider,
    providerId: string,
  ): Promise<User> {
    let user = await this.prisma.user.findFirst({
      where: { provider, providerId },
    });

    if (user) return user;

    // 같은 이메일로 다른 Provider로 이미 가입된 사용자가 있는지 확인.
    user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      throw new ConflictException(
        `이 이메일은 이미 ${user.provider} 계정으로 가입되어 있습니다.`,
      );
    }

    try {
      user = await this.prisma.user.create({
        data: {
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        },
      });

      return user;
    } catch (_error) {
      throw new InternalServerErrorException(
        '사용자 생성 중 오류가 발생했습니다.',
      );
    }
  }

  async findById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
