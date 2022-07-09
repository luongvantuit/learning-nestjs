import { ArgsType, Field } from '@nestjs/graphql';
import { CountryCode } from 'libphonenumber-js';
import { SORT_ENUM } from '../../../shared/enums/sort.enum';

@ArgsType()
export class CmsUserFindArg {
  @Field(() => String, {
    nullable: true,
    description: 'Display name user wanna search!',
  })
  displayName?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Is country code : Example VN,...',
  })
  countryCode?: CountryCode;

  @Field(() => String, {
    nullable: true,
    description: 'Is phone number!',
  })
  phoneNumber?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Is email!',
  })
  email?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Is user name!',
  })
  userName?: string;

  @Field(() => Date, {
    nullable: true,
    description: 'Data create account!',
  })
  createAt?: Date;

  @Field(() => String, {
    nullable: true,
    description: 'Sort by display name!',
  })
  sortByDisplayName?: SORT_ENUM;

  @Field(() => String, {
    nullable: true,
    description: 'Sort by country code!',
  })
  sortByCountryCode?: SORT_ENUM;

  @Field(() => String, {
    nullable: true,
    description: 'Sort by phone number!',
  })
  sortByPhoneNumber?: SORT_ENUM;

  @Field(() => String, {
    nullable: true,
    description: 'Sort by email!',
  })
  sortByEmail?: SORT_ENUM;

  @Field(() => String, {
    nullable: true,
    description: 'Sort by user name!',
  })
  sortByUserName?: SORT_ENUM;

  @Field(() => String, {
    nullable: true,
    description: 'Sort by create at!',
  })
  sortByCreateAt?: SORT_ENUM;

  @Field(() => Number, { nullable: true, description: 'Number page' })
  page?: number;

  @Field(() => Number, {
    nullable: true,
    description: 'Is length array return',
  })
  length?: number;
}
