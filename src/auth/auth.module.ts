import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../shared/schemas/device.schema';
import {
  SpecialToken,
  SpecialTokenSchema,
} from '../shared/schemas/special-token.schema';
import { User, UserSchema } from '../shared/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthRenderService } from './services/auth-render.service';
import { AuthService } from './services/auth.service';
import { CustomJwtService } from './services/custom-jwt.service';
import { OtpService } from './services/otp.service';

@Global()
@Module({
  imports: [
    UserModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SpecialToken.name, schema: SpecialTokenSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    JwtModule.register({}),
  ],
  providers: [
    AuthResolver,
    AuthService,
    OtpService,
    CustomJwtService,
    AuthRenderService,
  ],
  exports: [AuthService, OtpService, CustomJwtService, AuthRenderService],
})
export class AuthModule {}
