import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../../src/users/users.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Provider, User } from '@prisma/client';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    nickname: 'Test User',
    password: null,
    profileImageUrl: 'https://example.com/photo.jpg',
    provider: Provider.GOOGLE,
    providerId: 'google-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('서비스가 정의되어야 한다', () => {
    expect(usersService).toBeDefined();
  });

  describe('findOrCreateOAuthUser', () => {
    const email = 'test@example.com';
    const nickname = 'Test User';
    const profileImageUrl = 'https://example.com/photo.jpg';
    const provider = Provider.GOOGLE;
    const providerId = 'google-123';

    test('이미 존재하는 사용자를 찾아서 반환해야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      // when
      const result = await usersService.findOrCreateOAuthUser(
        email,
        nickname,
        profileImageUrl,
        provider,
        providerId,
      );

      // then
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { provider, providerId },
      });
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    test('provider와 providerId로 사용자를 조회해야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      // when
      await usersService.findOrCreateOAuthUser(
        email,
        nickname,
        profileImageUrl,
        provider,
        providerId,
      );

      // then
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { provider, providerId },
      });
    });

    test('사용자가 없으면 새로운 사용자를 생성해야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      // when
      const result = await usersService.findOrCreateOAuthUser(
        email,
        nickname,
        profileImageUrl,
        provider,
        providerId,
      );

      // then
      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        },
      });
    });

    test('nickname이 null이어도 사용자를 생성할 수 있어야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        nickname: null,
      });

      // when
      await usersService.findOrCreateOAuthUser(
        email,
        null,
        profileImageUrl,
        provider,
        providerId,
      );

      // then
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          nickname: null,
          profileImageUrl,
          provider,
          providerId,
        },
      });
    });

    test('profileImageUrl이 null이어도 사용자를 생성할 수 있어야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        profileImageUrl: null,
      });

      // when
      await usersService.findOrCreateOAuthUser(
        email,
        nickname,
        null,
        provider,
        providerId,
      );

      // then
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          nickname,
          profileImageUrl: null,
          provider,
          providerId,
        },
      });
    });

    test('같은 이메일로 다른 Provider로 가입된 사용자가 있으면 ConflictException을 던져야 한다', async () => {
      // given
      const existingUser = {
        ...mockUser,
        provider: Provider.KAKAO,
        providerId: 'kakao-456',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      // when & then
      await expect(
        usersService.findOrCreateOAuthUser(
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow(ConflictException);

      await expect(
        usersService.findOrCreateOAuthUser(
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow(
        `이 이메일은 이미 ${Provider.KAKAO} 계정으로 가입되어 있습니다.`,
      );
    });

    test('이메일 중복 체크 시 올바른 이메일로 조회해야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      // when
      await usersService.findOrCreateOAuthUser(
        email,
        nickname,
        profileImageUrl,
        provider,
        providerId,
      );

      // then
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    test('사용자 생성 중 에러가 발생하면 InternalServerErrorException을 던져야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Database error'),
      );

      // when & then
      await expect(
        usersService.findOrCreateOAuthUser(
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        usersService.findOrCreateOAuthUser(
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow('사용자 생성 중 오류가 발생했습니다.');
    });

    test('데이터베이스 연결 실패 시 InternalServerErrorException을 던져야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Connection timeout'),
      );

      // when & then
      await expect(
        usersService.findOrCreateOAuthUser(
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    test('Prisma 제약 조건 위반 시 InternalServerErrorException을 던져야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      // when & then
      await expect(
        usersService.findOrCreateOAuthUser(
          email,
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    test('빈 이메일로 사용자를 생성하려 하면 에러를 던져야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Email cannot be empty'),
      );

      // when & then
      await expect(
        usersService.findOrCreateOAuthUser(
          '',
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    test('잘못된 이메일 형식이면 에러를 던져야 한다', async () => {
      // given
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Invalid email format'),
      );

      // when & then
      await expect(
        usersService.findOrCreateOAuthUser(
          'invalid-email',
          nickname,
          profileImageUrl,
          provider,
          providerId,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findById', () => {
    test('ID로 사용자를 찾아서 비밀번호를 제외하고 반환해야 한다', async () => {
      // given
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // when
      const result = await usersService.findById(1);

      // then
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nickname: mockUser.nickname,
        profileImageUrl: mockUser.profileImageUrl,
        provider: mockUser.provider,
        providerId: mockUser.providerId,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    test('사용자가 없으면 NotFoundException을 던져야 한다', async () => {
      // given
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // when & then
      await expect(usersService.findById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(usersService.findById(999)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });

    test('존재하지 않는 ID로 조회 시 NotFoundException을 던져야 한다', async () => {
      // given
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // when & then
      await expect(usersService.findById(-1)).rejects.toThrow(
        NotFoundException,
      );
    });

    test('음수 ID로 조회 시 NotFoundException을 던져야 한다', async () => {
      // given
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // when & then
      await expect(usersService.findById(-100)).rejects.toThrow(
        NotFoundException,
      );
    });

    test('데이터베이스 연결 실패 시 에러를 던져야 한다', async () => {
      // given
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // when & then
      await expect(usersService.findById(1)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
