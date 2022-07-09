import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../shared/schemas/user.schema';
import { CmsUserResolver } from './resolvers/cms-user.resolver';
import { CmsUserService } from './services/cms-user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [CmsUserService, CmsUserResolver],
})
export class CmsUserModule {}
