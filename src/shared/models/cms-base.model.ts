import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

export interface ICmsBaseType<T> {
  items?: T[];

  hasNext?: boolean;

  currentPage: number;

  totalPage: number;
}

export function CmsBaseModel<T>(classRef: Type<T>): Type<ICmsBaseType<T>> {
  // Is abstract template  for cms
  @ObjectType({ isAbstract: true })
  abstract class CmsBaseType implements ICmsBaseType<T> {
    @Field(() => [classRef], {
      name: 'items',
      nullable: true,
      description: `${classRef.name} data`,
    })
    items?: T[];

    @Field(() => Boolean, {
      name: 'hasNext',
      nullable: true,
      defaultValue: false,
      description: 'Has next page',
    })
    hasNext?: boolean;

    @Field(() => Number, {
      name: 'currentPage',
      nullable: false,
      description: 'Current page',
    })
    currentPage: number;

    @Field(() => Number, {
      name: 'totalPage',
      nullable: false,
      description: 'Is max page number',
    })
    totalPage: number;
  }

  return CmsBaseType as Type<ICmsBaseType<T>>;
}
