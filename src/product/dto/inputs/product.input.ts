import { ProductFilterInput } from './product-filter.input';
import { Field, InputType, ArgsType } from '@nestjs/graphql';
import { ClassifyInput } from '../../../classify/dto/inputs/classify.input';

@InputType()
export class ProductInput {
  @Field(() => String, { nullable: true })
  sellerId?: string;

  @Field(() => String)
  name: string;

  @Field(() => [String])
  category: string[];

  @Field(() => [String])
  photos: string[];

  @Field(() => String)
  brand: string;

  @Field(() => String)
  description: string;

  @Field(() => ClassifyInput)
  classifies: ClassifyInput;
}

@InputType()
export class ProductListInput {
  @Field(() => Number)
  page: number;

  @Field(() => ProductFilterInput, { nullable: true })
  filterInput?: ProductFilterInput;
}

@InputType()
export class FindProductInput {
  @Field(() => String)
  readonly _id: string;
}

@InputType()
export class UpdateProductInput {
  @Field(() => String)
  readonly _id: string;

  @Field(() => String)
  name: string;

  @Field(() => [String])
  category: string[];

  @Field(() => [String])
  photos: string[];

  @Field(() => String)
  brand: string;

  @Field(() => String)
  description!: string;
}

@ArgsType()
export class SearchInput {
  @Field(() => String)
  searchname: string;

  @Field(() => String, {
    nullable: true,
  })
  category?: string;

  @Field(() => String, {
    nullable: true,
  })
  brand?: string;

  @Field(() => String, {
    nullable: true,
  })
  sort?: 'increase' | 'decrease';

  @Field(() => Number, {
    nullable: true,
  })
  min?: number;

  @Field(() => Number, {
    nullable: true,
  })
  max?: number;
}
