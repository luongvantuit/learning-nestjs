import { Test, TestingModule } from '@nestjs/testing';

import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../../shared/schemas/user.schema';
import {
  SpecialToken,
  SpecialTokenSchema,
} from '../../shared/schemas/special-token.schema';
import { Device, DeviceSchema } from '../../shared/schemas/device.schema';
import { OtpService } from './otp.service';
import { AuthRenderService } from './auth-render.service';
import { AppService } from '../../app.service';
import { CustomJwtService } from './custom-jwt.service';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { VARIABLE_ENVIRONMENT_ENUM } from '../../shared/enums/variable-environment.enum';
import { JwtModule } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CountryCode } from 'libphonenumber-js';

let mongoMemoryServer: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

describe('AuthService', () => {
  let authService: AuthService;
  let otpService: OtpService;

  beforeAll(async () => {
    const authModule: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: SpecialToken.name, schema: SpecialTokenSchema },
          { name: Device.name, schema: DeviceSchema },
        ]),
        WinstonModule.forRoot({}),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: join(
            process.cwd(),
            `${
              process.env.NODE_ENV == 'production' ? '.env.production' : '.env'
            }`,
          ),
        }),
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
        JwtModule.register({}),
      ],
      providers: [
        AuthService,
        OtpService,
        AuthRenderService,
        AppService,
        CustomJwtService,
      ],
    }).compile();

    authService = authModule.get<AuthService>(AuthService);
    otpService = authModule.get<OtpService>(OtpService);
  });

  describe('Sign Up With Phone Number', () => {
    it('Format Phone number Error', async () => {
      try {
        await authService.signUpWithPhoneNumber('+9', 'Te' as CountryCode);
      } catch (error) {
        console.log(error.response);
        expect(error.status).toEqual(400);
      }
    });

    it('Phone Number is Error!', async () => {
      try {
        await authService.signUpWithPhoneNumber('+849654');
      } catch (error) {
        console.log(error.response);
        expect(error.status).toEqual(500);
      }
    });

    it('Otp code wrong!', async () => {
      try {
        const otpCode = otpService.generateOtpCode(6);
        jest
          .spyOn(otpService, 'generateOtpCode')
          .mockImplementation(() => otpCode);
        const token = await authService.signUpWithPhoneNumber(
          '+84965445305',
          undefined,
          '::1',
        );
        expect(token).not.toBeNull();
        try {
          await authService.verifyOtpTokenSignUpWithPhoneNumber(
            '::1',
            token,
            otpCode.substring(2),
          );
        } catch (error) {
          console.log(error.response);
          expect(error.status).toEqual(400);
        }
      } catch (error) {
        console.log(error.response);
        expect(error.status).toEqual(500);
      }
    });

    it('Sign Up Success!', async () => {
      const otpCode = otpService.generateOtpCode(6);
      jest
        .spyOn(otpService, 'generateOtpCode')
        .mockImplementation(() => otpCode);
      const token = await authService.signUpWithPhoneNumber(
        '+84965445305',
        undefined,
        '::1',
      );
      expect(token).not.toBeNull();
    });
  });

  afterAll(async () => {
    if (mongoMemoryServer) await mongoMemoryServer.stop();
  });
});
