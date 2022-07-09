import { Field, InputType } from '@nestjs/graphql';

export interface ClassType<T = any> {
  new (...args: any): T;
}

export interface Filter {
  name?: string;
  category?: string;
  brand?: string;
}

export interface RangePrice {
  max?: number;
  min?: number;
  sort?: 'ASC' | 'DESC';
}

export function InputTypeFilter<T, E>(TClass: ClassType<T>, EClass: ClassType<E>): any {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @InputType()
  abstract class InputTypeFilterClass {
    @Field(() => TClass, {nullable: true})
    filter?: T;

    @Field(() => EClass, {nullable: true})
    rangePrice?: E;
  }
  return InputTypeFilterClass;
}
