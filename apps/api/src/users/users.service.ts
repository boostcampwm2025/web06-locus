import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider, User } from '@prisma/client';
import {
  UserNotFoundException,
  UserEmailAlreadyExistsException,
  OAuthEmailConflictException,
} from './exception';

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

    if (user) throw new OAuthEmailConflictException(user.provider);

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

  async signup(
    email: string,
    hashedPassword: string,
    nickname?: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) throw new UserEmailAlreadyExistsException();

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        provider: Provider.LOCAL,
      },
    });
  }

  async findById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new UserNotFoundException();

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UserNotFoundException();

    return user;
  }

  async isExistsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return false;
    return true;
  }
}
