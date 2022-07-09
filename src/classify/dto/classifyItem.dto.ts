import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClassifyItemDto {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  quantity: number;

  @Field(() => Number)
  price: number;
}

@ObjectType()
export class ItemVariationInfoDto {
  @Field(() => String)
  name: string;

  @Field(() => String, {nullable: true})
  link?: string;
  
  @Field(() => Number)
  quantity: number;
  
  @Field(() => Number)
  price: number;
}

@ObjectType()
export class VariationInfoDto {
  @Field(() => String)
  nameDisplay: string;

  @Field(() => [ItemVariationInfoDto])
  dataIn: ItemVariationInfoDto[];
}
@ObjectType()
export class ItemLinkImageDto {
  @Field(() => String)
  name: string;

  @Field(() => String)
  image: string;
}

@ObjectType()
export class LinkImageDto {
  @Field(() => String)
  nameDisplay: string;

  @Field(() => [ItemLinkImageDto])
  dataIn: ItemLinkImageDto[];
}