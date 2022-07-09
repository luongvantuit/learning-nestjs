import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

@ObjectType('User', { description: 'Model user information of user' })
export class UserModel {
  @Field(() => String, {
    name: 'uid',
    nullable: true,
    description: 'Field is information user id of user',
  })
  uid?: string;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'displayName',
    nullable: true,
    description: 'Field is display name of user',
  })
  displayName?: string;

  @Prop({ required: true, type: Date })
  @Field(() => Date, {
    name: 'createAt',
    nullable: true,
    description: 'Create at user create account',
  })
  createAt?: Date;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'address',
    nullable: true,
    description: 'Address of user',
  })
  address?: string;

  @Prop({ required: false, type: String })
  @Field(() => String, { name: 'bio', nullable: true, description: 'Bio' })
  bio?: string;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'photoAvatar',
    nullable: true,
    description: 'URL photo avatar of user',
  })
  photoAvatar?: string;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'photoCover',
    nullable: true,
    description: 'URL photo cover',
  })
  photoCover?: string;

  @Prop({ required: false, type: Date })
  @Field(() => Date, {
    name: 'birthDay',
    nullable: true,
    description: 'Birth Day',
  })
  birthDay?: Date;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'userName',
    nullable: true,
    description: 'User name of user',
  })
  userName?: string;

  @Prop({ required: false, type: String })
  @Field(() => String, {
    name: 'countryCode',
    nullable: true,
    description: 'Is country code of user',
  })
  countryCode?: string;
}
