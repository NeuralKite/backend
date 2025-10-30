import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, getAppPort } from './app.bootstrap';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await configureApp(app);

  const port = getAppPort(app);
  await app.listen(port);
}

void bootstrap();
