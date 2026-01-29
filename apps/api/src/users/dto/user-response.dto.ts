import { UserWithoutPassword } from '@/common/type/user.types';
import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: '8QplTsjYRhP3', description: '유저 public Id' })
  publicId: string;

  @ApiProperty({ example: 'test@example.com', description: '유저 이메일' })
  email: string;

  @ApiProperty({ example: 'beomsic', description: '닉네임', nullable: true })
  nickname: string | null;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: '프로필 이미지 URL',
    nullable: true,
  })
  profileImageUrl: string | null;

  @ApiProperty({ example: 'LOCAL', description: '가입 경로 (LOCAL, GOOGLE..)' })
  provider: Provider;

  @ApiProperty({ description: '가입 일' })
  createdAt: Date;

  static from(user: UserWithoutPassword) {
    return {
      publicId: user.publicId,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      provider: user.provider,
      createdAt: user.createdAt,
    };
  }
}
