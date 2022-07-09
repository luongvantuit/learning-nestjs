import { ObjectType } from '@nestjs/graphql';
import { AuthResultModel } from './auth-result.model';

/**
 * @extends {AuthResultModel}
 * Object Type DecodeAccessTokenModel contain base attributes of AuthResult
 */
@ObjectType('DecodeAccessToken')
export class DecodeAccessTokenModel extends AuthResultModel {}
