import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { VARIABLE_ENVIRONMENT_ENUM } from './shared/enums/variable-environment.enum';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const logger: WinstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  const configService = await app.get(ConfigService);
  await app.listen(configService.get(VARIABLE_ENVIRONMENT_ENUM.PORT), () => {
    logger.log(
      `🚀 Server running on ${(
        configService.get('NODE_ENV') ?? 'development'
      ).toUpperCase()} http://localhost:${configService.get(
        VARIABLE_ENVIRONMENT_ENUM.PORT,
      )}/graphql`,
      'Bootstrap',
    );
  });
}
bootstrap();
