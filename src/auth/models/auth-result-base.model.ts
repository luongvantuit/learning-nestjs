import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { PROVIDER_AUTH_ENUM } from '../../shared/enums/provider-auth.enum';
import { UserModel } from '../../user/models/user.model';

/**
 * @extends {UserModel}
 */
@ObjectType('AuthResultBase')
export class AuthResultBaseModel extends UserModel {
  @Prop({ required: false, type: Boolean, default: false })
  @Field(() => Boolean, {
    name: 'isVerify',
    nullable: true,
    defaultValue: false,
    description: 'Field define information email of user is verify',
  })
  isVerify?: boolean;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'email',
    nullable: true,
    description: 'Field is display email of user',
  })
  email?: string;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'phoneNumber',
    nullable: true,
    description: 'Field is display phone number of user',
  })
  phoneNumber?: string;

  @Prop({
    required: true,
    type: String,
    enum: ['password', 'facebook', 'google'],
  })
  @Field(() => String, {
    name: 'provider',
    nullable: true,
    description: 'Field is type provider, example: password, facebook, google ',
  })
  provider?: PROVIDER_AUTH_ENUM;
}
