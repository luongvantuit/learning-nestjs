import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { AccountArg } from '../dto/args/account.arg';
import { DecodeAccessTokenModel } from '../models/decode-access-token.model';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { AuthResultModel } from '../models/auth-result.model';
import { CountryCode } from 'libphonenumber-js';
import { IpRequestDecorator } from '../../shared/decorators/ip-request.decorator';
import { UserAgentRequestDecorator } from '../../shared/decorators/user-agent-request.decorator';
import { RequestGraphQLDecorator } from '../../shared/decorators/request-graphql.decorator';
import { Request } from 'express';
import { TOKEN_ENUM } from '../../shared/enums/token.enum';

/**
 * Handler authentication GraphQL request
 */
@Resolver(() => AuthResultModel)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  @Query(() => AuthResultModel, {
    name: 'signInWithAnyMethod',
    description:
      'Client submit to server information of account, sign in with username, phone number or email',
  })
  async signInWithAnyMethod(
    @IpRequestDecorator() ip: string,
    @Args({
      nullable: false,
      description: 'Information account of user!',
      type: () => AccountArg,
    })
    account: AccountArg,
  ): Promise<AuthResultModel | null> {
    return this.authService.signInWithAnyMethod(ip, account);
  }

  @Query(() => AuthResultModel, {
    name: 'verifyOtpTokenSignInWithAnyMethod',
    description: 'Verify OTP code when user sign in new device',
    nullable: true,
  })
  async verifyOtpTokenSignInWithAnyMethod(
    @IpRequestDecorator() ip: string,
    @UserAgentRequestDecorator() userAgent: string,
    @RequestGraphQLDecorator<Request>() request: Request,
    @Args('otpCode', {
      name: 'otpCode',
      nullable: false,
      description: 'Is OTP code user submit from client',
    })
    otpCode: string,
  ): Promise<AuthResultModel | null> {
    // Get Otp token
    const otpToken: string | string[] = request.headers[TOKEN_ENUM.OTP_TOKEN];
    return this.authService.verifyOtpTokenSignInWithAnyMethod(
      ip,
      userAgent,
      otpToken as string,
      otpCode,
    );
  }

  @Query(() => String, {
    name: 'refreshToken',
    description:
      'Verify render new access token with refresh token of client submit',
    nullable: true,
  })
  async refreshToken(
    @IpRequestDecorator() ip: string,
    @RequestGraphQLDecorator<Request>() request: Request,
  ): Promise<string | null> {
    // Get refresh token
    const refreshToken: string | string[] =
      request.headers[TOKEN_ENUM.REFRESH_TOKEN];
    return this.authService.refreshToken(ip, refreshToken as string);
  }

  @Query(() => DecodeAccessTokenModel, {
    name: 'verifyAccessToken',
    description:
      'Verify & decode information of user with access token submit in request',
    nullable: true,
  })
  async verifyAccessToken(
    @RequestGraphQLDecorator<Request>() request: Request,
  ): Promise<DecodeAccessTokenModel | null> {
    // Get access token
    const accessToken: string | string[] =
      request.headers[TOKEN_ENUM.ACCESS_TOKEN];
    return this.authService.verifyAccessToken(accessToken as string);
  }

  @Query(() => String, {
    name: 'signUpWithPhoneNumber',
    nullable: true,
    description: 'Method is create new account of user with phone number',
  })
  async signUpWithPhoneNumber(
    @IpRequestDecorator() ip: string,
    @Args('phoneNumber', {
      name: 'phoneNumber',
      nullable: false,
      description: 'It is phone number of user submit',
    })
    phoneNumber: string,
    @Args('countryCode', {
      name: 'countryCode',
      description: 'Argument is country code of user submit from client',
      nullable: true,
    })
    countryCode?: CountryCode,
  ): Promise<string | null> {
    return this.authService.signUpWithPhoneNumber(phoneNumber, countryCode, ip);
  }

  @Query(() => String, {
    name: 'verifyOtpTokenSignUpWithPhoneNumber',
    nullable: true,
    description:
      'Render setup password token if user verify success OTP code sign up account with phone number',
  })
  async verifyOtpTokenSignUpWithPhoneNumber(
    @IpRequestDecorator() ip: string,
    @RequestGraphQLDecorator<Request>() request: Request,
    @Args('otpCode', {
      name: 'otpCode',
      nullable: false,
      description: 'Is OTP code submit by client',
    })
    otpCode: string,
  ): Promise<string | null> {
    // Get Otp token
    const otpToken: string | string[] = request.headers[TOKEN_ENUM.OTP_TOKEN];
    return this.authService.verifyOtpTokenSignUpWithPhoneNumber(
      ip,
      otpToken as string,
      otpCode,
    );
  }

  @Mutation(() => AuthResultModel, {
    name: 'setupPasswordForSignUpWithPhoneNumber',
    nullable: true,
    description:
      'Setup password when user verify success otp with setup password token',
  })
  async setupPasswordForSignUpWithPhoneNumber(
    @IpRequestDecorator() ip: string,
    @UserAgentRequestDecorator() userAgent: string,
    @RequestGraphQLDecorator<Request>() request: Request,
    @Args('password', {
      name: 'password',
      nullable: false,
      description: 'Is password setup for account',
    })
    password: string,
  ): Promise<AuthResultModel | null> {
    const setupPasswordToken: string | string[] =
      request.headers[TOKEN_ENUM.SETUP_PASSWORD_TOKEN];
    return this.authService.setupPasswordForSignUpWithPhoneNumber(
      ip,
      userAgent,
      setupPasswordToken as string,
      password,
    );
  }
}
