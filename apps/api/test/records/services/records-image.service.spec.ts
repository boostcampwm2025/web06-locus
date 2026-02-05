import { Test, TestingModule } from '@nestjs/testing';
import { RecordImageService } from '@/records/services/records-image.service';
import { ImageProcessingService } from '@/records/services/image-processing.service';
import { ObjectStorageService } from '@/records/services/object-storage.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { IMAGE_UPLOAD_CONFIG } from '@/records/config/image-upload.config';
import {
  ProcessedImage,
  UploadedImage,
} from '@/records/services/object-storage.types';

describe('RecordImageService', () => {
  let service: RecordImageService;

  const mockImageProcessingService = {
    process: jest.fn(),
  };

  const mockObjectStorageService = {
    uploadRecordImages: jest.fn(),
    deleteImages: jest.fn(),
    extractKeyFromUrl: jest.fn(),
  };

  const mockPrismaService = {
    image: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockImageUploadConfig = {
    webhook: {
      cacheTtlSec: 300,
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordImageService,
        {
          provide: ImageProcessingService,
          useValue: mockImageProcessingService,
        },
        {
          provide: ObjectStorageService,
          useValue: mockObjectStorageService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: IMAGE_UPLOAD_CONFIG,
          useValue: mockImageUploadConfig,
        },
      ],
    }).compile();

    service = module.get<RecordImageService>(RecordImageService);
  });

  describe('processAndUploadImages', () => {
    test('이미지를 처리하고 스토리지에 업로드한 후 결과를 반환해야 한다', async () => {
      // given
      const userPublicId = 'user_123';
      const recordPublicId = 'rec_456';
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'images',
          originalname: 'test1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake-image-1'),
          size: 1024,
        } as Express.Multer.File,
        {
          fieldname: 'images',
          originalname: 'test2.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake-image-2'),
          size: 2048,
        } as Express.Multer.File,
      ];

      const mockProcessedVariants = {
        thumbnail: {
          buffer: Buffer.from('thumb'),
          width: 200,
          height: 200,
          size: 500,
        },
        medium: {
          buffer: Buffer.from('medium'),
          width: 800,
          height: 600,
          size: 1500,
        },
        original: {
          buffer: Buffer.from('original'),
          width: 1920,
          height: 1080,
          size: 3000,
        },
      };

      mockImageProcessingService.process.mockResolvedValue(
        mockProcessedVariants,
      );

      const mockUploadResult = {
        uploadedImages: [
          {
            imageId: 'img_1',
            urls: {
              thumbnail: 'https://cdn.example.com/thumb1.jpg',
              medium: 'https://cdn.example.com/medium1.jpg',
              original: 'https://cdn.example.com/original1.jpg',
            },
          },
          {
            imageId: 'img_2',
            urls: {
              thumbnail: 'https://cdn.example.com/thumb2.jpg',
              medium: 'https://cdn.example.com/medium2.jpg',
              original: 'https://cdn.example.com/original2.jpg',
            },
          },
        ] as UploadedImage[],
        uploadedKeys: ['key1', 'key2', 'key3', 'key4', 'key5', 'key6'],
      };

      mockObjectStorageService.uploadRecordImages.mockResolvedValue(
        mockUploadResult,
      );

      // when
      const result = await service.processAndUploadImages(
        userPublicId,
        recordPublicId,
        mockFiles,
      );

      // then
      expect(mockImageProcessingService.process).toHaveBeenCalledTimes(2);
      expect(mockImageProcessingService.process).toHaveBeenCalledWith(
        mockFiles[0],
      );
      expect(mockImageProcessingService.process).toHaveBeenCalledWith(
        mockFiles[1],
      );

      expect(mockObjectStorageService.uploadRecordImages).toHaveBeenCalledTimes(
        1,
      );
      expect(mockObjectStorageService.uploadRecordImages).toHaveBeenCalledWith(
        userPublicId,
        recordPublicId,
        expect.arrayContaining([
          expect.objectContaining({
            imageId: expect.any(String),
            variants: mockProcessedVariants,
          }),
        ]),
      );

      expect(result.uploadedImages).toHaveLength(2);
      expect(result.uploadedKeys).toHaveLength(6);
      expect(result.processedImages).toHaveLength(2);
      expect(result.processedImages[0]).toHaveProperty('imageId');
      expect(result.processedImages[0]).toHaveProperty('variants');
    });

    test('이미지 처리 중 에러가 발생하면 예외를 던져야 한다', async () => {
      // given
      const userPublicId = 'user_123';
      const recordPublicId = 'rec_456';
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'images',
          originalname: 'corrupt.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('corrupt-data'),
          size: 500,
        } as Express.Multer.File,
      ];

      const processingError = new Error('Image processing failed');
      mockImageProcessingService.process.mockRejectedValue(processingError);

      // when & then
      await expect(
        service.processAndUploadImages(userPublicId, recordPublicId, mockFiles),
      ).rejects.toThrow('Image processing failed');
    });

    test('스토리지 업로드 중 에러가 발생하면 예외를 던져야 한다', async () => {
      // given
      const userPublicId = 'user_123';
      const recordPublicId = 'rec_456';
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'images',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake-image'),
          size: 1024,
        } as Express.Multer.File,
      ];

      const mockProcessedVariants = {
        thumbnail: {
          buffer: Buffer.from('thumb'),
          width: 200,
          height: 200,
          size: 500,
        },
        medium: {
          buffer: Buffer.from('medium'),
          width: 800,
          height: 600,
          size: 1500,
        },
        original: {
          buffer: Buffer.from('original'),
          width: 1920,
          height: 1080,
          size: 3000,
        },
      };

      mockImageProcessingService.process.mockResolvedValue(
        mockProcessedVariants,
      );

      const uploadError = new Error('Storage upload failed');
      mockObjectStorageService.uploadRecordImages.mockRejectedValue(
        uploadError,
      );

      // when & then
      await expect(
        service.processAndUploadImages(userPublicId, recordPublicId, mockFiles),
      ).rejects.toThrow('Storage upload failed');
    });
  });

  describe('saveImages', () => {
    test('처리된 이미지 정보를 DB에 저장해야 한다', async () => {
      // given
      const mockTx = {
        image: {
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
      } as any;

      const recordId = 100n;
      const processedImages: ProcessedImage[] = [
        {
          imageId: 'img_001',
          variants: {
            thumbnail: {
              buffer: Buffer.from('t1'),
              width: 200,
              height: 200,
              size: 500,
            },
            medium: {
              buffer: Buffer.from('m1'),
              width: 800,
              height: 600,
              size: 1500,
            },
            original: {
              buffer: Buffer.from('o1'),
              width: 1920,
              height: 1080,
              size: 3000,
            },
          },
        },
        {
          imageId: 'img_002',
          variants: {
            thumbnail: {
              buffer: Buffer.from('t2'),
              width: 200,
              height: 200,
              size: 600,
            },
            medium: {
              buffer: Buffer.from('m2'),
              width: 800,
              height: 600,
              size: 1600,
            },
            original: {
              buffer: Buffer.from('o2'),
              width: 1920,
              height: 1080,
              size: 3200,
            },
          },
        },
      ];

      const uploadedImages: UploadedImage[] = [
        {
          imageId: 'img_001',
          urls: {
            thumbnail: 'https://cdn.example.com/thumb1.jpg',
            medium: 'https://cdn.example.com/medium1.jpg',
            original: 'https://cdn.example.com/original1.jpg',
          },
        },
        {
          imageId: 'img_002',
          urls: {
            thumbnail: 'https://cdn.example.com/thumb2.jpg',
            medium: 'https://cdn.example.com/medium2.jpg',
            original: 'https://cdn.example.com/original2.jpg',
          },
        },
      ];

      // when
      await service.saveImages(
        mockTx,
        recordId,
        processedImages,
        uploadedImages,
      );

      // then
      expect(mockTx.image.createMany).toHaveBeenCalledTimes(1);
      expect(mockTx.image.createMany).toHaveBeenCalledWith({
        data: [
          {
            publicId: 'img_001',
            recordId: 100n,
            order: 0,
            thumbnailUrl: 'https://cdn.example.com/thumb1.jpg',
            thumbnailWidth: 200,
            thumbnailHeight: 200,
            thumbnailSize: 500,
            mediumUrl: 'https://cdn.example.com/medium1.jpg',
            mediumWidth: 800,
            mediumHeight: 600,
            mediumSize: 1500,
            originalUrl: 'https://cdn.example.com/original1.jpg',
            originalWidth: 1920,
            originalHeight: 1080,
            originalSize: 3000,
          },
          {
            publicId: 'img_002',
            recordId: 100n,
            order: 1,
            thumbnailUrl: 'https://cdn.example.com/thumb2.jpg',
            thumbnailWidth: 200,
            thumbnailHeight: 200,
            thumbnailSize: 600,
            mediumUrl: 'https://cdn.example.com/medium2.jpg',
            mediumWidth: 800,
            mediumHeight: 600,
            mediumSize: 1600,
            originalUrl: 'https://cdn.example.com/original2.jpg',
            originalWidth: 1920,
            originalHeight: 1080,
            originalSize: 3200,
          },
        ],
      });
    });
  });

  describe('getImagesByRecordIds', () => {
    test('레코드 ID 목록으로 이미지들을 조회하고 recordId별로 그룹화하여 반환해야 한다', async () => {
      // given
      const recordIds = [10n, 20n];

      const mockImages = [
        {
          recordId: 10n,
          publicId: 'img_1',
          order: 0,
          thumbnailUrl: 'https://cdn.example.com/10/thumb1.jpg',
          thumbnailWidth: 200,
          thumbnailHeight: 200,
          thumbnailSize: 500,
          mediumUrl: 'https://cdn.example.com/10/medium1.jpg',
          mediumWidth: 800,
          mediumHeight: 600,
          mediumSize: 1500,
          originalUrl: 'https://cdn.example.com/10/original1.jpg',
          originalWidth: 1920,
          originalHeight: 1080,
          originalSize: 3000,
        },
        {
          recordId: 10n,
          publicId: 'img_2',
          order: 1,
          thumbnailUrl: 'https://cdn.example.com/10/thumb2.jpg',
          thumbnailWidth: 200,
          thumbnailHeight: 200,
          thumbnailSize: 600,
          mediumUrl: 'https://cdn.example.com/10/medium2.jpg',
          mediumWidth: 800,
          mediumHeight: 600,
          mediumSize: 1600,
          originalUrl: 'https://cdn.example.com/10/original2.jpg',
          originalWidth: 1920,
          originalHeight: 1080,
          originalSize: 3200,
        },
        {
          recordId: 20n,
          publicId: 'img_3',
          order: 0,
          thumbnailUrl: 'https://cdn.example.com/20/thumb1.jpg',
          thumbnailWidth: 200,
          thumbnailHeight: 200,
          thumbnailSize: 700,
          mediumUrl: 'https://cdn.example.com/20/medium1.jpg',
          mediumWidth: 800,
          mediumHeight: 600,
          mediumSize: 1700,
          originalUrl: 'https://cdn.example.com/20/original1.jpg',
          originalWidth: 1920,
          originalHeight: 1080,
          originalSize: 3300,
        },
      ];

      mockPrismaService.image.findMany.mockResolvedValue(mockImages);

      // when
      const result = await service.getImagesByRecordIds({ recordIds });

      // then
      expect(mockPrismaService.image.findMany).toHaveBeenCalledWith({
        where: {
          recordId: { in: recordIds },
        },
        orderBy: { order: 'asc' },
        select: expect.objectContaining({
          recordId: true,
          publicId: true,
          order: true,
          thumbnailUrl: true,
        }),
      });

      expect(result.size).toBe(2);
      expect(result.get(10n)).toHaveLength(2);
      expect(result.get(20n)).toHaveLength(1);
      expect(result.get(10n)?.[0].publicId).toBe('img_1');
      expect(result.get(10n)?.[1].publicId).toBe('img_2');
      expect(result.get(20n)?.[0].publicId).toBe('img_3');
    });

    test('onlyFirst가 true이면 각 레코드의 첫 번째 이미지만 조회해야 한다', async () => {
      // given
      const recordIds = [10n];

      const mockImages = [
        {
          recordId: 10n,
          publicId: 'img_1',
          order: 0,
          thumbnailUrl: 'https://cdn.example.com/thumb1.jpg',
          thumbnailWidth: 200,
          thumbnailHeight: 200,
          thumbnailSize: 500,
          mediumUrl: 'https://cdn.example.com/medium1.jpg',
          mediumWidth: 800,
          mediumHeight: 600,
          mediumSize: 1500,
          originalUrl: 'https://cdn.example.com/original1.jpg',
          originalWidth: 1920,
          originalHeight: 1080,
          originalSize: 3000,
        },
      ];

      mockPrismaService.image.findMany.mockResolvedValue(mockImages);

      // when
      await service.getImagesByRecordIds({ recordIds, onlyFirst: true });

      // then
      expect(mockPrismaService.image.findMany).toHaveBeenCalledWith({
        where: {
          recordId: { in: recordIds },
          order: 0,
        },
        orderBy: { order: 'asc' },
        select: expect.any(Object),
      });
    });

    test('트랜잭션 컨텍스트가 제공되면 해당 트랜잭션을 사용해야 한다', async () => {
      // given
      const recordIds = [10n];
      const mockTx = {
        image: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as any;

      // when
      await service.getImagesByRecordIds({ recordIds, tx: mockTx });

      // then
      expect(mockTx.image.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.image.findMany).not.toHaveBeenCalled();
    });

    test('빈 recordIds 배열이 전달되면 빈 Map을 반환해야 한다', async () => {
      // given
      const recordIds: bigint[] = [];

      // when
      const result = await service.getImagesByRecordIds({ recordIds });

      // then
      expect(result.size).toBe(0);
      expect(mockPrismaService.image.findMany).not.toHaveBeenCalled();
    });

    test('이미지가 없는 레코드는 Map에 포함되지 않아야 한다', async () => {
      // given
      const recordIds = [10n, 20n];
      mockPrismaService.image.findMany.mockResolvedValue([]);

      // when
      const result = await service.getImagesByRecordIds({ recordIds });

      // then
      expect(result.size).toBe(0);
    });
  });

  describe('deleteImagesFromStorage', () => {
    test('이미지 URL 목록에서 키를 추출하고 스토리지에서 삭제해야 한다', async () => {
      // given
      const imageUrls: string[] = [
        'https://cdn.example.com/users/user1/records/rec1/thumb.jpg',
        'https://cdn.example.com/users/user1/records/rec1/medium.jpg',
        'https://cdn.example.com/users/user1/records/rec1/original.jpg',
        'https://cdn.example.com/users/user1/records/rec1/thumb2.jpg',
        'https://cdn.example.com/users/user1/records/rec1/medium2.jpg',
        'https://cdn.example.com/users/user1/records/rec1/original2.jpg',
      ];

      mockObjectStorageService.extractKeyFromUrl
        .mockReturnValueOnce('users/user1/records/rec1/thumb.jpg')
        .mockReturnValueOnce('users/user1/records/rec1/medium.jpg')
        .mockReturnValueOnce('users/user1/records/rec1/original.jpg')
        .mockReturnValueOnce('users/user1/records/rec1/thumb2.jpg')
        .mockReturnValueOnce('users/user1/records/rec1/medium2.jpg')
        .mockReturnValueOnce('users/user1/records/rec1/original2.jpg');

      mockObjectStorageService.deleteImages.mockResolvedValue(undefined);

      // when
      await service.deleteImagesFromStorage(imageUrls);

      // then
      expect(mockObjectStorageService.extractKeyFromUrl).toHaveBeenCalledTimes(
        6,
      );
      expect(mockObjectStorageService.deleteImages).toHaveBeenCalledWith([
        'users/user1/records/rec1/thumb.jpg',
        'users/user1/records/rec1/medium.jpg',
        'users/user1/records/rec1/original.jpg',
        'users/user1/records/rec1/thumb2.jpg',
        'users/user1/records/rec1/medium2.jpg',
        'users/user1/records/rec1/original2.jpg',
      ]);
    });

    test('빈 배열이 전달되면 스토리지 삭제를 호출하지 않아야 한다', async () => {
      // given
      const imageUrls: string[] = [];

      // when
      await service.deleteImagesFromStorage(imageUrls);

      // then
      expect(mockObjectStorageService.deleteImages).not.toHaveBeenCalled();
      expect(mockObjectStorageService.extractKeyFromUrl).not.toHaveBeenCalled();
    });
  });
});
