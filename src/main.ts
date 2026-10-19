import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Default to not trusting proxy unless explicitly enabled via environment variable
  const trustProxyEnv = process.env.TRUST_PROXY;
  const shouldTrustProxy = trustProxyEnv === 'true' || trustProxyEnv === '1';

  if (shouldTrustProxy) {
    app.set('trust proxy', true);
  } else {
    app.set('trust proxy', false);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: await app.getUrl()`);
}

bootstrap();