import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Request } from 'express';
import { CountryCode } from 'libphonenumber-js';
import { AusVieRequestGraphQLDecorator } from '../../shared/decorators/aus-vie-request-graphql.decorator';
import { IpRequestDecorator } from '../../shared/decorators/ip-request.decorator';
import { JwtAccessTokenDecorator } from '../../shared/decorators/jwt-access-token.decorator';
import { RequestGraphQLDecorator } from '../../shared/decorators/request-graphql.decorator';
import { AusVieRequest } from '../../shared/dto/interfaces/aus-vie-request.interface';
import { JwtAccessTokenPayload } from '../../shared/dto/payloads/jwt-access-token.payload';
import { TOKEN_ENUM } from '../../shared/enums/token.enum';
import { JwtVerifyTokenGraphQLGuard } from '../../shared/guards/jwt-verify-token-graphql.guard';
import { ProfileInput } from '../dto/inputs/profile.input';
import { UserModel } from '../models/user.model';
import { UserService } from '../services/user.service';

@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserModel, {
    name: 'getUserById',
    nullable: true,
    description: 'Get information of user with uid',
  })
  async getUserById(
    @Args('uid', {
      name: 'uid',
      nullable: true,
      description: 'uid submit from client',
    })
    uid?: string,
  ): Promise<UserModel | null> {
    return this.userService.getUserById(uid);
  }

  @Query(() => UserModel, {
    name: 'getUserByAccessToken',
    nullable: true,
    description: 'Get information of user with access token',
  })
  @UseGuards(JwtVerifyTokenGraphQLGuard)
  getUserByAccessToken(
    @JwtAccessTokenDecorator()
    jwtAccessTokenPayload: JwtAccessTokenPayload,
  ): UserModel | null {
    return this.userService.getUserByAccessToken(jwtAccessTokenPayload);
  }

  @Query(() => UserModel, {
    name: 'getUserWithAnyMethod',
    nullable: true,
    description: 'Get all user with any method search name, email or user name',
  })
  async getUserWithAnyMethod(
    @Args('argument', {
      name: 'argument',
      nullable: true,
      description: 'Is string email, user name or id',
    })
    argument?: string,
    @Args('countryCode', {
      name: 'countryCode',
      description:
        'Is country code of phone number user wanna find information',
      nullable: true,
    })
    countryCode?: CountryCode,
  ): Promise<UserModel | null> {
    return this.userService.getUserWithAnyMethod(argument, countryCode);
  }

  @UseGuards(JwtVerifyTokenGraphQLGuard)
  @Query(() => Boolean, {
    name: 'deleteAccount',
    description: 'Delete all formation important of user!',
    defaultValue: false,
  })
  async deleteAccount(
    @AusVieRequestGraphQLDecorator<AusVieRequest>() request: AusVieRequest,
    @Args('reason', {
      name: 'reason',
      description: 'Reason user wanna delete account',
      nullable: false,
    })
    reason: string,
  ): Promise<boolean> {
    return this.userService.deleteAccount(request.user.uid, reason);
  }

  @Query(() => String, {
    name: 'resetPassword',
    description: 'Request return token reset new password!',
    nullable: true,
  })
  async resetPassword(
    @IpRequestDecorator() ip: string,
    @Args('argument', {
      name: 'argument',
      description:
        'Is user name, phone number or email of user wanna request reset password!',
      nullable: true,
    })
    argument?: string,
    @Args('countryCode', {
      name: 'countryCode',
      description:
        'Is country code of phone number user wanna find information',
      nullable: true,
    })
    countryCode?: CountryCode,
  ): Promise<string> {
    return this.userService.resetPassword(ip, argument, countryCode);
  }

  @Query(() => String, {
    name: 'verifyOtpTokenResetPassword',
    nullable: true,
    description: 'Verify OTP when setup new password',
  })
  async verifyOtpTokenResetPassword(
    @IpRequestDecorator() ip: string,
    @RequestGraphQLDecorator<Request>() request: Request,
    @Args('otpCode', {
      name: 'otpCode',
      nullable: false,
      description: 'Is OTP code submit from client!',
    })
    otpCode: string,
  ): Promise<string | null> {
    // Get Otp token from header
    const otpToken: string | string[] = request.headers[TOKEN_ENUM.OTP_TOKEN];
    return this.userService.verifyOtpTokenResetPassword(
      ip,
      otpToken as string,
      otpCode,
    );
  }

  @Mutation(() => Boolean, {
    name: 'setupNewPassword',
    description: 'Verify reset password token & setup new password!',
    nullable: true,
    defaultValue: false,
  })
  async setupNewPassword(
    @IpRequestDecorator() ip: string,
    @RequestGraphQLDecorator<Request>() request: Request,
    @Args('password', {
      name: 'password',
      nullable: false,
      description: 'Is new password!',
    })
    password: string,
  ): Promise<boolean | null> {
    // Get setup password token from header
    const setupPasswordToken: string | string[] =
      request.headers[TOKEN_ENUM.SETUP_PASSWORD_TOKEN];
    return this.userService.setupNewPassword(
      ip,
      setupPasswordToken as string,
      password,
    );
  }

  @UseGuards(JwtVerifyTokenGraphQLGuard)
  @Mutation(() => UserModel, {
    nullable: true,
    description: 'Is update information of user!',
    name: 'updateProfile',
  })
  async updateProfile(
    @JwtAccessTokenDecorator() jwtAccessTokenPayload: JwtAccessTokenPayload,
    @Args('profile', {
      name: 'profile',
      nullable: false,
      description: 'Is new information of user!',
      type: () => ProfileInput,
    })
    profile: ProfileInput,
  ): Promise<UserModel | null> {
    return this.userService.updateProfile(jwtAccessTokenPayload, profile);
  }
}
