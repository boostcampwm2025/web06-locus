import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Profile } from 'passport-kakao';
import { KakaoStrategy } from '../../../src/auth/strategies/kakao.strategy';
import { UsersService } from '../../../src/users/users.service';
import { Provider } from '@prisma/client';

describe('KakaoStrategy 테스트', () => {
  let strategy: KakaoStrategy;
  let usersService: UsersService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config = {
        KAKAO_CLIENT_ID: 'test-kakao-client-id',
        KAKAO_CLIENT_SECRET: 'test-kakao-client-secret',
        KAKAO_CALLBACK_URL: 'http://localhost:3000/auth/kakao/callback',
      };
      return config[key];
    }),
  };

  const mockUsersService = {
    findOrCreateOAuthUser: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@kakao.com',
    nickname: 'Test User',
    profileImageUrl: 'https://kakao.com/profile.jpg',
    provider: Provider.KAKAO,
    providerId: 'kakao-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KakaoStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<KakaoStrategy>(KakaoStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const accessToken = 'valid-access-token';
    const refreshToken = 'refresh-token';
    const done = jest.fn();

    const createMockProfile = (
      id: number,
      email?: string,
      nickname?: string,
      profileImageUrl?: string,
    ): Profile => {
      return {
        provider: 'kakao',
        id: String(id),
        displayName: nickname ?? '',
        _json: {
          id,
          kakao_account: {
            email,
            profile: {
              nickname,
              profile_image_url: profileImageUrl,
            },
          },
        },
      } as Profile;
    };

    beforeEach(() => {
      done.mockClear();
    });

    test('카카오 프로필로 사용자를 생성하거나 조회해야 한다', async () => {
      // given
      const mockProfile = createMockProfile(
        123456789,
        'test@kakao.com',
        'Test User',
        'https://kakao.com/profile.jpg',
      );
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, mockProfile, done);

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'test@kakao.com',
        'Test User',
        'https://kakao.com/profile.jpg',
        Provider.KAKAO,
        '123456789',
      );
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    test('사용자 정보로 findOrCreateOAuthUser를 호출해야 한다', async () => {
      // given
      const mockProfile = createMockProfile(
        987654321,
        'user@kakao.com',
        'Kakao User',
        'https://kakao.com/user.jpg',
      );
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, mockProfile, done);

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'user@kakao.com',
        'Kakao User',
        'https://kakao.com/user.jpg',
        Provider.KAKAO,
        '987654321',
      );
    });

    test('nickname이 없어도 사용자를 생성할 수 있어야 한다', async () => {
      // given
      const mockProfile = createMockProfile(
        123456789,
        'test@kakao.com',
        undefined,
        'https://kakao.com/profile.jpg',
      );
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, mockProfile, done);

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'test@kakao.com',
        null,
        'https://kakao.com/profile.jpg',
        Provider.KAKAO,
        '123456789',
      );
    });

    test('profile_image_url이 없어도 사용자를 생성할 수 있어야 한다', async () => {
      // given
      const mockProfile = createMockProfile(
        123456789,
        'test@kakao.com',
        'Test User',
        undefined,
      );
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, mockProfile, done);

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'test@kakao.com',
        'Test User',
        null,
        Provider.KAKAO,
        '123456789',
      );
    });

    test('이메일이 없으면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const mockProfile = createMockProfile(
        123456789,
        undefined,
        'Test User',
        'https://kakao.com/profile.jpg',
      );

      // when
      await strategy.validate(accessToken, refreshToken, mockProfile, done);

      // then
      expect(done).toHaveBeenCalledWith(
        expect.any(UnauthorizedException),
        null,
      );
      expect(done.mock.calls[0][0].message).toBe(
        'Kakao 계정에 이메일 정보가 없습니다.',
      );
    });

    test('kakao_account가 없으면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const mockProfile = {
        provider: 'kakao',
        id: '123456789',
        displayName: 'Test User',
        _json: {
          id: 123456789,
        },
      } as Profile;

      // when
      await strategy.validate(accessToken, refreshToken, mockProfile, done);

      // then
      expect(done).toHaveBeenCalledWith(
        expect.any(UnauthorizedException),
        null,
      );
    });

    test('UsersService에서 ConflictException이 발생하면 done에 에러를 전달해야 한다', async () => {
      // given
      const error = new Error('이미 가입된 이메일입니다');
      const mockProfile = createMockProfile(
        123456789,
        'test@kakao.com',
        'Test User',
      );
      mockUsersService.findOrCreateOAuthUser.mockRejectedValue(error);

      // when
      await strategy.validate(accessToken, refreshToken, mockProfile, done);

      // then
      expect(done).toHaveBeenCalledWith(error, null);
    });
  });
});
