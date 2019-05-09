import { NestFactory, NestApplication } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  app.enableCors();

  app.useStaticAssets(join(__dirname, '../../client/dist'), {
    index: ['index.html'],
    redirect: false,
  });

  await app.listen(3000);
}
bootstrap();
