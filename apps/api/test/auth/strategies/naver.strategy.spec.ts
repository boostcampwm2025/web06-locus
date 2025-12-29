import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { NaverStrategy } from '../../../src/auth/strategies/naver.strategy';
import { UsersService } from '../../../src/users/users.service';
import { Provider } from '@prisma/client';

describe('NaverStrategy 테스트', () => {
  let strategy: NaverStrategy;
  let usersService: UsersService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config = {
        NAVER_CLIENT_ID: 'test-naver-client-id',
        NAVER_CLIENT_SECRET: 'test-naver-client-secret',
        NAVER_CALLBACK_URL: 'http://localhost:3000/auth/naver/callback',
      };
      return config[key];
    }),
  };

  const mockUsersService = {
    findOrCreateOAuthUser: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@naver.com',
    nickname: 'Test User',
    profileImageUrl: 'https://naver.com/profile.jpg',
    provider: Provider.NAVER,
    providerId: 'naver-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NaverStrategy,
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

    strategy = module.get<NaverStrategy>(NaverStrategy);
    usersService = module.get<UsersService>(UsersService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const accessToken = 'valid-access-token';
    const refreshToken = 'refresh-token';
    const profile = {};
    const done = jest.fn();

    const mockNaverResponse = {
      resultcode: '00',
      message: 'success',
      response: {
        id: 'naver-123',
        email: 'test@naver.com',
        name: 'Test User',
        profile_image: 'https://naver.com/profile.jpg',
      },
    };

    beforeEach(() => {
      done.mockClear();
    });

    test('유효한 액세스 토큰으로 사용자를 생성하거나 조회해야 한다', async () => {
      // given
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockNaverResponse,
      });
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(global.fetch).toHaveBeenCalledWith(
        'https://openapi.naver.com/v1/nid/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'test@naver.com',
        'Test User',
        'https://naver.com/profile.jpg',
        Provider.NAVER,
        'naver-123',
      );
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    test('네이버 API 호출 시 accessToken을 추가한 헤더를 사용해야 한다', async () => {
      // given
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockNaverResponse,
      });
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(global.fetch).toHaveBeenCalledWith(
        'https://openapi.naver.com/v1/nid/me',
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
    });

    test('name이 없어도 사용자를 생성할 수 있어야 한다', async () => {
      // given
      const responseWithoutName = {
        ...mockNaverResponse,
        response: {
          ...mockNaverResponse.response,
          name: undefined,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => responseWithoutName,
      });
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'test@naver.com',
        null,
        'https://naver.com/profile.jpg',
        Provider.NAVER,
        'naver-123',
      );
    });

    test('profile_image가 없어도 사용자를 생성할 수 있어야 한다', async () => {
      // given
      const responseWithoutImage = {
        ...mockNaverResponse,
        response: {
          ...mockNaverResponse.response,
          profile_image: undefined,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => responseWithoutImage,
      });
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'test@naver.com',
        'Test User',
        null,
        Provider.NAVER,
        'naver-123',
      );
    });

    test('네이버 API 호출이 실패하면 InternalServerErrorException을 던져야 한다', async () => {
      // given
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(done).toHaveBeenCalledWith(
        expect.any(InternalServerErrorException),
      );
      expect(done.mock.calls[0][0].message).toBe(
        '네이버 API 호출에 실패했습니다.',
      );
    });

    test('네이버 API 응답의 resultcode가 00이 아니면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const errorResponse = {
        resultcode: '024',
        message: '인증 실패',
        response: null,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => errorResponse,
      });

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException));
      expect(done.mock.calls[0][0].message).toBe('네이버 인증 실패: 인증 실패');
    });

    test('이메일이 없으면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const responseWithoutEmail = {
        resultcode: '00',
        message: 'success',
        response: {
          id: 'naver-123',
          email: '',
          name: 'Test User',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => responseWithoutEmail,
      });

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException));
      expect(done.mock.calls[0][0].message).toBe(
        '네이버 계정에 이메일 정보가 없습니다.',
      );
    });

    test('UsersService에서 에러가 발생하면 done에 에러를 전달해야 한다', async () => {
      // given
      const error = new Error('Database error');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockNaverResponse,
      });
      mockUsersService.findOrCreateOAuthUser.mockRejectedValue(error);

      // when
      await strategy.validate(accessToken, refreshToken, profile, done);

      // then
      expect(done).toHaveBeenCalledWith(error);
    });
  });
});
