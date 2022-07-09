import { Field, ObjectType } from '@nestjs/graphql';

export interface ClassType<T = any> {
  new (...args: any): T;
}

export interface IDataResponse<T> {
  data?: T;
  statusCode: string;
  errorMessage?: string;
}

export default function DataResponse<T>(TClass: ClassType<T>): any {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class ResponseClass {
    @Field(() => TClass, { nullable: true })
    data?: T;

    @Field(() => String)
    statusCode: string;

    @Field(() => String, { nullable: true })
    errorMessage?: string;
  }
  return ResponseClass;
}

export function DataResponseArray<T>(TClass: ClassType<T>): any {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class ResponseClassArray {
    @Field(() => [TClass], { nullable: true })
    data?: T[];

    @Field(() => String)
    statusCode: string;

    @Field(() => String, { nullable: true })
    errorMessage?: string;
  }
  return ResponseClassArray;
}

export interface IPaginationResponse<T> {
  items: T[];
  currentPage: number;
  totalPage: number;
}

export function PaginationResponse<T>(TClass: ClassType<T>): any {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginationResponseClass {
    @Field(() => [TClass])
    items?: T[];

    @Field(() => Number)
    currentPage: number;

    @Field(() => Number)
    totalPage: number;
  }
  return PaginationResponseClass;
}
