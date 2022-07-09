import { Args, Query, Resolver } from '@nestjs/graphql';
import { CmsUserFindArg } from '../../../cms/dto/args/cms-user-find.arg';
import { CmsUserModel } from '../models/cms-user.model';
import { CmsUserService } from '../services/cms-user.service';

@Resolver(() => CmsUserModel)
export class CmsUserResolver {
  constructor(private readonly cmsUserService: CmsUserService) {}
  @Query(() => CmsUserModel, {
    name: 'cmsUserFind',
    description: 'Query information of all user!',
    nullable: true,
  })
  async cmsUserFind(
    @Args({ nullable: true }) cmsUserFindArg: CmsUserFindArg,
  ): Promise<CmsUserModel> {
    return this.cmsUserService.cmsUserFind(cmsUserFindArg);
  }
}
