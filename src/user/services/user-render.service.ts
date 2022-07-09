import { Injectable } from '@nestjs/common';
import { JwtAccessTokenPayload } from '../../shared/dto/payloads/jwt-access-token.payload';
import { UserDocument } from '../../shared/schemas/user.schema';
import { UserModel } from '../models/user.model';

/**
 * Render UserModel
 */
@Injectable()
export class UserRenderService {
  renderFromDocument(user: UserDocument): UserModel {
    return {
      uid: user._id,
      ...user,
    };
  }

  renderFromJwtAccessTokenPayload(
    jwtAccessTokenPayload: JwtAccessTokenPayload,
  ): UserModel {
    return {
      ...jwtAccessTokenPayload,
    };
  }
}
