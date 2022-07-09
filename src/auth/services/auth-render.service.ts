import { Injectable } from '@nestjs/common';
import { DeviceDocument } from '../../shared/schemas/device.schema';
import { UserDocument } from '../../shared/schemas/user.schema';
import { AuthResultModel } from '../models/auth-result.model';
import { CustomJwtService } from './custom-jwt.service';

/**
 * Render information return of auth model contain access token, refresh token,...
 */
@Injectable()
export class AuthRenderService {
  constructor(private readonly customJwtService: CustomJwtService) {}
  /**
   * Return information contain access token, refresh token,...
   * @param user is user document not null
   * @param device is device document not null(contain information of device)
   * @returns {Promise<AuthResultModel>}
   */
  async render(
    user: UserDocument,
    device: DeviceDocument,
  ): Promise<AuthResultModel> {
    return await {
      uid: user._id,
      accessToken: await this.customJwtService.signAccessTokenByDocument(user),
      refreshToken: await this.customJwtService.signRefreshTokenByDocument(
        user,
        device,
      ),
      ...user,
    };
  }
}
