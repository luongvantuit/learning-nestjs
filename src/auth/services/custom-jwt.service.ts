import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenPayload } from '../../shared/dto/payloads/jwt-access-token.payload';
import { JwtRefreshTokenPayload } from '../../shared/dto/payloads/jwt-refresh-token.payload';
import { JwtSpecialTokenPayload } from '../../shared/dto/payloads/jwt-special-token.payload';
import { VARIABLE_ENVIRONMENT_ENUM } from '../../shared/enums/variable-environment.enum';
import { DeviceDocument } from '../../shared/schemas/device.schema';
import { UserDocument } from '../../shared/schemas/user.schema';

/**
 * Custom verify & sign with JwtService
 */
@Injectable()
export class CustomJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Return refresh token
   * @param jwtRefreshTokenPayload is payload contain uid, deviceId
   * @returns {Promise<string>}
   */
  async signRefreshToken(
    jwtRefreshTokenPayload: JwtRefreshTokenPayload,
  ): Promise<string> {
    // await sign token from payload
    const jwtRefreshToken: string = await this.jwtService.signAsync(
      jwtRefreshTokenPayload,
      {
        secret: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.JWT_REFRESH_TOKEN_SECRET,
        ),
        expiresIn: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.JWT_REFRESH_TOKEN_EXPIRES_IN,
        ),
      },
    );
    return jwtRefreshToken;
  }

  /**
   * Return refresh token require user document & device document
   * @param user
   * @param device
   * @returns {Promise<string>}
   */
  async signRefreshTokenByDocument(
    user: UserDocument,
    device: DeviceDocument,
  ): Promise<string> {
    // await sign new refresh token
    return await this.signRefreshToken({
      uid: user._id,
      deviceId: device._id,
    });
  }

  /**
   * Return new access token with access token payload
   * @param jwtAccessTokenPayload is payload contain phone number & ...
   * @returns {Promise<string>}
   */
  async signAccessToken(
    jwtAccessTokenPayload: JwtAccessTokenPayload,
  ): Promise<string> {
    // await sign access token from payload
    const jwtAccessToken: string = await this.jwtService.signAsync(
      jwtAccessTokenPayload,
      {
        secret: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.JWT_ACCESS_TOKEN_SECRET,
        ),
        expiresIn: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.JWT_ACCESS_TOKEN_EXPIRES_IN,
        ),
      },
    );
    return jwtAccessToken;
  }

  /**
   * Return new access token with user document
   * @param user is user document
   * @returns {Promise<string>}
   */
  async signAccessTokenByDocument(user: UserDocument): Promise<string> {
    // await sign new access token with user document
    return await this.signAccessToken({
      uid: user._id,
      address: user.address,
      bio: user.bio,
      birthDay: user.birthDay,
      countryCode: user.countryCode,
      createAt: user.createAt,
      displayName: user.displayName,
      email: user.email,
      isVerify: user.isVerify,
      phoneNumber: user.phoneNumber,
      photoAvatar: user.photoAvatar,
      photoCover: user.photoCover,
      userName: user.userName,
      accessTokenSocialNetwork: user.accessTokenSocialNetwork,
      provider: user.provider,
    });
  }

  /**
   * Return special token is otp token or setup password token,...
   * @param jwtSpecialTokenPayload base is jwt special token payload
   * @returns {Promise<string>}
   */
  async signSpecialToken<T extends JwtSpecialTokenPayload>(
    jwtSpecialTokenPayload: T,
  ): Promise<string> {
    // await new special token
    const jwtSpecialToken: string = await this.jwtService.signAsync(
      jwtSpecialTokenPayload,
      {
        secret: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.JWT_SPECIAL_TOKEN_SECRET,
        ),
        expiresIn: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.JWT_SPECIAL_TOKEN_EXPIRES_IN,
        ),
      },
    );
    return jwtSpecialToken;
  }

  /**
   * Return payload after verify access token success!
   * @param accessToken is access token submit from client
   * @returns {Promise<JwtAccessTokenPayload>}
   */
  async verifyAccessToken(accessToken: string): Promise<JwtAccessTokenPayload> {
    let jwtAccessTokenPayload: JwtAccessTokenPayload;
    // await verify access token
    try {
      jwtAccessTokenPayload =
        await this.jwtService.verifyAsync<JwtAccessTokenPayload>(accessToken, {
          secret: this.configService.get<string>(
            VARIABLE_ENVIRONMENT_ENUM.JWT_ACCESS_TOKEN_SECRET,
          ),
        });
    } catch (error: any) {
      throw new UnauthorizedException('Access token is not valid!');
    }
    return jwtAccessTokenPayload;
  }

  /**
   * Return payload refresh token when verify refresh token is success!
   * @param refreshToken is refresh token submit from client
   * @returns {Promise<JwtRefreshTokenPayload>}
   */
  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtRefreshTokenPayload> {
    let jwtRefreshTokenPayload: JwtRefreshTokenPayload;
    // await render refresh token payload
    try {
      jwtRefreshTokenPayload =
        await this.jwtService.verifyAsync<JwtRefreshTokenPayload>(
          refreshToken,
          {
            secret: this.configService.get<string>(
              VARIABLE_ENVIRONMENT_ENUM.JWT_REFRESH_TOKEN_SECRET,
            ),
          },
        );
    } catch (error: any) {
      throw new UnauthorizedException('Refresh token is not valid!');
    }
    return jwtRefreshTokenPayload;
  }

  /**
   * Return payload special token
   * @param specialToken
   * @returns {Promise<T extends JwtSpecialTokenPayload>}
   */
  async verifySpecialToken<T extends JwtSpecialTokenPayload>(
    specialToken: string,
  ): Promise<T> {
    let jwtSpecialTokenPayload: T;
    // await render special token payload
    try {
      jwtSpecialTokenPayload = await this.jwtService.verifyAsync<T>(
        specialToken,
        {
          secret: this.configService.get<string>(
            VARIABLE_ENVIRONMENT_ENUM.JWT_SPECIAL_TOKEN_SECRET,
          ),
        },
      );
    } catch (error: any) {
      throw new UnauthorizedException('Special token is not valid!');
    }
    return jwtSpecialTokenPayload;
  }
}
