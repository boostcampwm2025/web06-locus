import { Test, TestingModule } from '@nestjs/testing';
import { FcmService } from '../../../src/notification/fcm/fcm.service';
import { NotificationService } from '../../../src/notification/notification.service';
import { FIREBASE_PROVIDER } from '../../../src/notification/firebase.config';
import * as admin from 'firebase-admin';
import { NotificationData } from '../../../src/notification/type/notification.types';
import {
  DAILY_REMINDER_TEMPLATE,
  NotificationType,
} from '../../../src/notification/constants/notification.constants';

// Firebase 에러 모킹
jest.mock('../../../src/notification/exception/firebase-error.guard', () => ({
  isFirebaseError: jest.fn(),
  isTokenExpiredError: jest.fn(),
  isRetryableError: jest.fn(),
}));

import { isTokenExpiredError } from '../../../src/notification/exception/firebase-error.guard';

describe('FcmService 테스트', () => {
  let service: FcmService;
  let notificationService: NotificationService;
  let mockFirebaseAdmin: jest.Mocked<admin.app.App>;

  // Mock 데이터
  const mockUserId1 = '123';
  const mockUserId2 = '456';
  const mockUserId3 = '789';
  const mockToken1 = 'fcm_token_abc123';
  const mockToken2 = 'fcm_token_def456';
  const mockToken3 = 'fcm_token_ghi789';

  const mockNotificationDatas: NotificationData[] = [
    { userId: mockUserId1, token: mockToken1 },
    { userId: mockUserId2, token: mockToken2 },
    { userId: mockUserId3, token: mockToken3 },
  ];

  const mockSendEachForMulticast = jest.fn();
  const mockMessaging = {
    sendEachForMulticast: mockSendEachForMulticast,
  } as unknown as admin.messaging.Messaging;

  const mockNotificationService = {
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    mockFirebaseAdmin = {
      messaging: jest.fn().mockReturnValue(mockMessaging),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmService,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: FIREBASE_PROVIDER,
          useValue: mockFirebaseAdmin,
        },
      ],
    }).compile();

    service = module.get<FcmService>(FcmService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendDailyReminderBatch', () => {
    describe('성공 케이스', () => {
      test('모든 사용자에게 알림을 성공적으로 전송한다', async () => {
        // given
        const mockBatchResponse: admin.messaging.BatchResponse = {
          successCount: 3,
          failureCount: 0,
          responses: [
            { success: true, messageId: 'msg1' },
            { success: true, messageId: 'msg2' },
            { success: true, messageId: 'msg3' },
          ],
        };
        mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);

        // when
        const result = await service.sendDailyReminderBatch(
          mockNotificationDatas,
        );

        // then
        expect(result).toEqual([]);
        expect(mockSendEachForMulticast).toHaveBeenCalledWith({
          tokens: [mockToken1, mockToken2, mockToken3],
          notification: {
            title: DAILY_REMINDER_TEMPLATE.title,
            body: DAILY_REMINDER_TEMPLATE.body,
          },
          data: { type: NotificationType.DAILY_REMINDER },
          webpush: expect.objectContaining({
            notification: expect.objectContaining({
              title: DAILY_REMINDER_TEMPLATE.title,
              body: DAILY_REMINDER_TEMPLATE.body,
            }),
          }),
        });
        expect(notificationService.deactivate).not.toHaveBeenCalled();
      });

      test('빈 배열로 호출하면 빈 배열을 반환한다', async () => {
        // given
        const mockBatchResponse: admin.messaging.BatchResponse = {
          successCount: 0,
          failureCount: 0,
          responses: [],
        };
        mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);

        // when
        const result = await service.sendDailyReminderBatch([]);

        // then
        expect(result).toEqual([]);
        expect(mockSendEachForMulticast).toHaveBeenCalledWith({
          tokens: [],
          notification: expect.any(Object),
          data: expect.any(Object),
          webpush: expect.any(Object),
        });
      });
    });

    describe('토큰 만료 케이스', () => {
      test('토큰 만료 시 해당 사용자를 비활성화하고 재시도 목록에서 제외한다', async () => {
        // given
        const tokenExpiredError = {
          code: 'messaging/invalid-registration-token',
          message: 'Invalid token',
        };
        const mockBatchResponse: admin.messaging.BatchResponse = {
          successCount: 2,
          failureCount: 1,
          responses: [
            { success: true, messageId: 'msg1' },
            { success: false, error: tokenExpiredError as any },
            { success: true, messageId: 'msg3' },
          ],
        };
        mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);
        (isTokenExpiredError as jest.Mock).mockReturnValue(true);
        mockNotificationService.deactivate.mockResolvedValue(undefined);

        // when
        const result = await service.sendDailyReminderBatch(
          mockNotificationDatas,
        );

        // then
        expect(result).toEqual([]);
        expect(notificationService.deactivate).toHaveBeenCalledWith(
          BigInt(mockUserId2),
        );
        expect(notificationService.deactivate).toHaveBeenCalledTimes(1);
      });

      test('여러 토큰이 만료된 경우 모두 비활성화한다', async () => {
        // given
        const tokenExpiredError = {
          code: 'messaging/invalid-registration-token',
          message: 'Invalid token',
        };
        const mockBatchResponse: admin.messaging.BatchResponse = {
          successCount: 1,
          failureCount: 2,
          responses: [
            { success: false, error: tokenExpiredError as any },
            { success: true, messageId: 'msg2' },
            { success: false, error: tokenExpiredError as any },
          ],
        };
        mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);
        (isTokenExpiredError as jest.Mock).mockReturnValue(true);
        mockNotificationService.deactivate.mockResolvedValue(undefined);

        // when
        const result = await service.sendDailyReminderBatch(
          mockNotificationDatas,
        );

        // then
        expect(result).toEqual([]);
        expect(notificationService.deactivate).toHaveBeenCalledWith(
          BigInt(mockUserId1),
        );
        expect(notificationService.deactivate).toHaveBeenCalledWith(
          BigInt(mockUserId3),
        );
        expect(notificationService.deactivate).toHaveBeenCalledTimes(2);
      });

      test('토큰 비활성화 실패 시 에러를 로깅하고 계속 진행한다', async () => {
        // given
        const tokenExpiredError = {
          code: 'messaging/invalid-registration-token',
          message: 'Invalid token',
        };
        const mockBatchResponse: admin.messaging.BatchResponse = {
          successCount: 2,
          failureCount: 1,
          responses: [
            { success: true, messageId: 'msg1' },
            { success: false, error: tokenExpiredError as any },
            { success: true, messageId: 'msg3' },
          ],
        };
        mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);
        (isTokenExpiredError as jest.Mock).mockReturnValue(true);
        mockNotificationService.deactivate.mockRejectedValue(
          new Error('DB update failed'),
        );

        // when
        const result = await service.sendDailyReminderBatch(
          mockNotificationDatas,
        );

        // then
        expect(result).toEqual([]);
        expect(notificationService.deactivate).toHaveBeenCalledWith(
          BigInt(mockUserId2),
        );
      });
    });

    describe('재시도 가능한 에러 케이스', () => {
      test('재시도 가능한 에러 발생 시 해당 사용자를 재시도 목록에 추가한다', async () => {
        // given
        const retryableError = {
          code: 'messaging/server-unavailable',
          message: 'Server unavailable',
        };
        const mockBatchResponse: admin.messaging.BatchResponse = {
          successCount: 2,
          failureCount: 1,
          responses: [
            { success: true, messageId: 'msg1' },
            { success: false, error: retryableError as any },
            { success: true, messageId: 'msg3' },
          ],
        };
        mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);
        (isTokenExpiredError as jest.Mock).mockReturnValue(false);

        // when
        const result = await service.sendDailyReminderBatch(
          mockNotificationDatas,
        );

        // then
        expect(result).toEqual([{ userId: mockUserId2, token: mockToken2 }]);
        expect(notificationService.deactivate).not.toHaveBeenCalled();
      });

      test('재시도 가능한 에러가 발생한 경우 모두 재시도 목록에 추가한다', async () => {
        // given
        const retryableError = {
          code: 'messaging/internal-error',
          message: 'Internal error',
        };
        const mockBatchResponse: admin.messaging.BatchResponse = {
          successCount: 1,
          failureCount: 2,
          responses: [
            { success: false, error: retryableError as any },
            { success: true, messageId: 'msg2' },
            { success: false, error: retryableError as any },
          ],
        };
        mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);
        (isTokenExpiredError as jest.Mock).mockReturnValue(false);

        // when
        const result = await service.sendDailyReminderBatch(
          mockNotificationDatas,
        );

        // then
        expect(result).toEqual([
          { userId: mockUserId1, token: mockToken1 },
          { userId: mockUserId3, token: mockToken3 },
        ]);
        expect(notificationService.deactivate).not.toHaveBeenCalled();
      });
    });

    describe('FCM API 호출 실패 케이스', () => {
      test('FCM API 호출이 실패하면 에러를 전파한다', async () => {
        // given
        const fcmError = new Error('FCM service unavailable');
        mockSendEachForMulticast.mockRejectedValue(fcmError);

        // when & then
        await expect(
          service.sendDailyReminderBatch(mockNotificationDatas),
        ).rejects.toThrow(fcmError);
        expect(notificationService.deactivate).not.toHaveBeenCalled();
      });
    });
  });
});
