import { Module } from '@nestjs/common';
import { CmsUserModule } from './user/cms-user.module';

@Module({
  imports: [CmsUserModule],
})
export class CmsModule {}
