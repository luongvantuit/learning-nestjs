import { Field, ObjectType } from '@nestjs/graphql';
import DataResponse, {
  DataResponseArray,
} from '../../shared/schemas/response.model';

@ObjectType()
export class CartDto {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  classifyId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Number)
  quantity: number;

  @Field(() => String)
  productName: string;

  @Field(() => Number)
  price: number;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => Boolean, { defaultValue: false })
  statusOrder: boolean;
}

@ObjectType()
export class CartResponse extends DataResponse(CartDto) {}

@ObjectType()
export class CartsResponse extends DataResponseArray(CartDto) {}
