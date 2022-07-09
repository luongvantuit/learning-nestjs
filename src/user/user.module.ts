import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../shared/schemas/device.schema';
import {
  SpecialToken,
  SpecialTokenSchema,
} from '../shared/schemas/special-token.schema';
import { User, UserSchema } from '../shared/schemas/user.schema';
import { UserResolver } from './resolvers/user.resolver';
import { UserRenderService } from './services/user-render.service';
import { UserService } from './services/user.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: SpecialToken.name, schema: SpecialTokenSchema },
    ]),
    JwtModule.register({}),
  ],
  providers: [UserResolver, UserService, UserRenderService],
})
export class UserModule {}
