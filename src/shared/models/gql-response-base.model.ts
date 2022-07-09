import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

export interface IGqlResponseBase<T> {
  statusCode: string;

  errorMessage?: string;

  data?: T;
}

export function GqlResponseBaseModel<T>(
  classRef: Type<T>,
): Type<IGqlResponseBase<T>> {
  @ObjectType({ isAbstract: true })
  abstract class GqlResponseBaseType<T> implements IGqlResponseBase<T> {
    @Field(() => String, {
      nullable: false,
      name: 'statusCode',
      description: 'Is status code response of request!',
    })
    statusCode: string;

    @Field(() => classRef, {
      name: classRef.name,
      nullable: true,
      description: `Data of ${classRef.name}!`,
    })
    data?: T;

    @Field(() => String, {
      nullable: true,
      name: 'errorMessage',
      description: 'Is error message of request!',
    })
    errorMessage?: string;
  }

  return GqlResponseBaseType as Type<IGqlResponseBase<T>>;
}
