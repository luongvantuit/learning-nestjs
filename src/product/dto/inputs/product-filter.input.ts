import { RangePrice, Filter } from './../../../shared/schemas/query-options.type';
import { Field, InputType} from '@nestjs/graphql';
import { InputTypeFilter } from '../../../shared/schemas/query-options.type';

@InputType()
export class IFilterInput implements Filter {
  @Field(() => String)
  name?: string;

  @Field(() => String, {
    nullable: true,
  })
  category?: string;

  @Field(() => String, {
    nullable: true,
  })
  brand?: string;
}

@InputType()
export class IRangePrice implements RangePrice {
  @Field(() => Number, {
    nullable: true,
  })
  max?: number;

  @Field(() => Number, {
    nullable: true,
  })
  min?: number;

  @Field(() => String, {
    nullable: true,
  })
  sort?: 'ASC' | 'DESC';
}

@InputType()
export class ProductFilterInput extends InputTypeFilter(
  IFilterInput,
  IRangePrice,
) {}
