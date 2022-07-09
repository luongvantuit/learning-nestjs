import { Global, Module } from '@nestjs/common';
import { ClassifyModule } from './classify/classify.module';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { TwilioModule } from 'nestjs-twilio';
import { VARIABLE_ENVIRONMENT_ENUM } from './shared/enums/variable-environment.enum';
import { CmsModule } from './cms/cms.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './shared/schemas/http-exception.filter';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: join(process.cwd(), 'logger'),
          filename: 'logger.log',
        }),
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.graphql'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(
        process.cwd(),
        `${process.env.NODE_ENV == 'production' ? '.env.production' : '.env'}`,
      ),
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        accountSid: configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.TWILIO_ACCOUNT_SID,
        ),
        authToken: configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.TWILIO_AUTH_TOKEN,
        ),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ProductModule,
    CmsModule,
    ClassifyModule,
    CartModule,
    OrderModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
