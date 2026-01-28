import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('기본 / 경로 요청 시 응답이 인터셉터를 통해 success 형태로 래핑되어 반환된다.', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);

    expect(res.body).toEqual({
      status: 'success',
      data: 'Hello World!',
    });
  });
});
