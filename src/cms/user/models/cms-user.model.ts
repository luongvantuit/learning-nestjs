import { ObjectType } from '@nestjs/graphql';
import { AuthResultBaseModel } from '../../../auth/models/auth-result-base.model';
import { CmsBaseModel } from '../../../shared/models/cms-base.model';

@ObjectType('CmsUser')
export class CmsUserModel extends CmsBaseModel(AuthResultBaseModel) {}
