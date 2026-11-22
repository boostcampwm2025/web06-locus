import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { ElasticsearchService } from '@/infra/elasticsearch/elasticsearch.service';

// ResponseError.statusCode는 getter라서 인스턴스에 직접 값을 정의해 흉내 낸다.
const responseError = (statusCode: number): Error =>
  Object.defineProperties(
    Object.create(errors.ResponseError.prototype) as Error,
    {
      statusCode: { value: statusCode },
      message: { value: `status ${statusCode}` },
    },
  );

describe('ElasticsearchService (external version 쓰기)', () => {
  let service: ElasticsearchService;

  const mockClient = {
    index: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        { provide: NestElasticsearchService, useValue: mockClient },
      ],
    }).compile();

    service = module.get(ElasticsearchService);
  });

  describe('indexDocument', () => {
    test('문서를 external version으로 써야 한다', async () => {
      // given
      mockClient.index.mockResolvedValue({ result: 'created' });

      // when
      const result = await service.indexDocument(
        'records',
        '100',
        { title: 't' },
        42,
      );

      // then
      expect(mockClient.index).toHaveBeenCalledWith({
        index: 'records',
        id: '100',
        document: { title: 't' },
        version: 42,
        version_type: 'external',
      });
      expect(result).toBe('APPLIED');
    });

    test('409(version conflict)는 예외가 아니라 STALE로 돌려줘야 한다', async () => {
      // given
      mockClient.index.mockRejectedValue(responseError(409));

      // when & then
      await expect(
        service.indexDocument('records', '100', {}, 1),
      ).resolves.toBe('STALE');
    });

    test('409 이외의 ES 오류는 그대로 던져야 한다', async () => {
      // given
      mockClient.index.mockRejectedValue(responseError(503));

      // when & then
      await expect(
        service.indexDocument('records', '100', {}, 1),
      ).rejects.toMatchObject({ statusCode: 503 });
    });

    test('네트워크 오류 같은 일반 예외도 그대로 던져야 한다', async () => {
      // given
      mockClient.index.mockRejectedValue(new Error('ECONNREFUSED'));

      // when & then
      await expect(
        service.indexDocument('records', '100', {}, 1),
      ).rejects.toThrow('ECONNREFUSED');
    });
  });

  describe('deleteDocument', () => {
    test('문서를 external version으로 삭제해야 한다', async () => {
      // given
      mockClient.delete.mockResolvedValue({ result: 'deleted' });

      // when
      const result = await service.deleteDocument('records', '100', 9);

      // then
      expect(mockClient.delete).toHaveBeenCalledWith({
        index: 'records',
        id: '100',
        version: 9,
        version_type: 'external',
      });
      expect(result).toBe('APPLIED');
    });

    test('문서가 없어도(404) 삭제 버전은 기록되므로 APPLIED로 다뤄야 한다', async () => {
      // given
      mockClient.delete.mockRejectedValue(responseError(404));

      // when & then
      await expect(service.deleteDocument('records', '100', 9)).resolves.toBe(
        'APPLIED',
      );
    });

    test('409(version conflict)는 STALE로 돌려줘야 한다', async () => {
      // given
      mockClient.delete.mockRejectedValue(responseError(409));

      // when & then
      await expect(service.deleteDocument('records', '100', 1)).resolves.toBe(
        'STALE',
      );
    });

    test('404/409 이외의 ES 오류는 그대로 던져야 한다', async () => {
      // given
      mockClient.delete.mockRejectedValue(responseError(500));

      // when & then
      await expect(
        service.deleteDocument('records', '100', 9),
      ).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
