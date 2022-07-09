import { Field, ObjectType } from '@nestjs/graphql';
import DataResponse, { DataResponseArray } from '../../shared/schemas/response.model';
import { LinkImageDto, VariationInfoDto } from './classifyItem.dto';

@ObjectType()
export class ClassifyDto {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => LinkImageDto, { nullable: true })
  linkImage?: string;

  @Field(() => VariationInfoDto, { nullable: true })
  variationInfo?: VariationInfoDto[];
}

@ObjectType()
export class ClassifyResponse extends DataResponse(ClassifyDto) {}

@ObjectType()
export class ClassifiesResponse extends DataResponseArray(ClassifyDto) {}