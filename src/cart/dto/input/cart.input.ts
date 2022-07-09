import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CartInput {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => String)
  classifyId: string;

  @Field(() => Number)
  quantity: number;

  @Field(() => Boolean, {defaultValue: false})
  statusOrder?: boolean;
}

@InputType()
export class UpdateCartInput {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  productId: string;

  @Field(() => String)
  classifyId: string;

  @Field(() => Number)
  quantity: number;
}

@InputType()
export class DeleteCartInput {
  @Field(() => String)
  _id: string;
}

@InputType()
export class FindCartInput {
  @Field(() => String)
  userId: string;
}
