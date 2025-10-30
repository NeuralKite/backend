import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.bootstrap';

describe('CartController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/cart/items should create an item', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .send({ name: 'Keyboard', price: 100, quantity: 1, currency: 'USD' })
      .expect(201);

    expect(response.body).toMatchObject({ name: 'Keyboard', price: 100 });
  });
});
