import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, ValidateIf } from 'class-validator';
import { CountryCode } from 'libphonenumber-js';

/**
 * Information account submit from client
 */
@ArgsType()
export class AccountArg {
  @Field(() => String, {
    name: 'user',
    description: 'Field is phone number, email or username of user submit',
    nullable: false,
  })
  @IsString({ message: 'Field is required' })
  user: string;

  @Field(() => String, {
    name: 'password',
    description: 'Field is password from client submit',
    nullable: false,
  })
  @IsString({ message: 'Password is empty. Please! enter your password' })
  password: string;

  @Field(() => String, {
    name: 'countryCode',
    nullable: true,
    description: 'Country code of phone number',
  })
  @IsString({ message: 'Field is information country code for user' })
  @ValidateIf((obj, v) => v !== null)
  countryCode?: CountryCode;
}
