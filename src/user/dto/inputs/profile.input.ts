import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ProfileInput {
  @Field(() => String, {
    name: 'displayName',
    nullable: true,
    description: 'Field is new display name!',
  })
  displayName?: string;

  @Field(() => Date, {
    name: 'birthDay',
    nullable: true,
    description: 'Birth Day',
  })
  birthDay?: Date;

  @Field(() => String, { name: 'bio', nullable: true, description: 'Bio' })
  bio?: string;

  @Field(() => String, {
    name: 'address',
    nullable: true,
    description: 'Address of user',
  })
  address?: string;
}
