import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { AuthResultBaseModel } from './auth-result-base.model';

/**
 * @extends {AuthResultBaseModel}
 */
@ObjectType('AuthResult')
export class AuthResultModel extends AuthResultBaseModel {
  @Field(() => String, {
    name: 'refreshToken',
    nullable: true,
    description: 'Field is token use get new access token',
  })
  refreshToken?: string;

  @Field(() => String, {
    name: 'accessToken',
    nullable: true,
    description: 'Field is access token for user modify information in system',
  })
  accessToken?: string;

  @Prop({ type: String, required: false })
  @Field(() => String, {
    name: 'accessTokenSocialNetwork',
    nullable: true,
    description: 'Field is access token of facebook or google',
  })
  accessTokenSocialNetwork?: string;

  @Field(() => String, {
    name: 'otpToken',
    nullable: true,
    description: 'Field is Otp token if device not allow',
  })
  otpToken?: string;
}
