import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClassifyDetail {
  @Field(() => String, {
    name: 'name',
    nullable: false,
  })
  name: string;

  @Field(() => String, {
    name: 'link',
    nullable: false,
  })
  link: string;

  @Field(() => Number, {
    name: 'quantity',
    nullable: false,
  })
  quantity: number;

  @Field(() => Number, {
    name: 'price',
    nullable: false,
  })
  price: string;
}

@ObjectType()
export class ProductDetail {
  @Field(() => String, {
    name: 'sellerId',
    nullable: false,
  })
  sellerId: string;

  @Field(() => String, {
    name: 'name',
    nullable: false,
  })
  name: string;

  @Field(() => [String], {
    name: 'category',
    nullable: false,
  })
  category: string[];

  @Field(() => String, {
    name: 'brand',
    nullable: false,
  })
  brand: string;

  @Field(() => String, {
    name: 'description',
    nullable: false,
  })
  description: string;

  @Field(() => Date, {
    name: 'createAt',
    nullable: false,
  })
  createAt: Date;

  @Field(() => Boolean, {
    name: 'deleted',
    nullable: false,
  })
  deleted: boolean;
}

@ObjectType()
export class CartDetail {
  @Field(() => ProductDetail, {
    name: 'product',
    nullable: false,
  })
  product: ProductDetail;

  @Field(() => String, {
    name: 'productId',
    nullable: false,
  })
  productId: string;

  @Field(() => String, {
    name: 'classifyId',
    nullable: false,
  })
  classifyId: string;

  @Field(() => Number, {
    name: 'quantity',
    nullable: false,
    defaultValue: 0,
  })
  quantity: number;

  @Field(() => ClassifyDetail, {
    name: 'classify',
    nullable: true,
  })
  classify: ClassifyDetail;
}

@ObjectType()
export class OrderModel {
  @Field(() => String, {
    name: 'orderId',
    nullable: false,
  })
  orderId: string;

  @Field(() => Number, {
    name: 'totalAmount',
    defaultValue: 0,
    nullable: false,
  })
  totalAmount: number;

  @Field(() => String, {
    name: 'userId',
    nullable: false,
  })
  userId: string;

  @Field(() => [String], {
    name: 'cartIds',
    nullable: false,
  })
  cartIds: string[];

  @Field(() => Date, {
    name: 'createAt',
    nullable: false,
  })
  createAt;

  @Field(() => String, {
    name: 'sellerId',
    nullable: false,
  })
  sellerId;

  @Field(() => String, {
    name: 'status',
    nullable: false,
  })
  status: string;

  @Field(() => [CartDetail], {
    name: 'carts',
    nullable: false,
  })
  carts: CartDetail[];
}
