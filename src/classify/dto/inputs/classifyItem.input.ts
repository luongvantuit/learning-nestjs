import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ClassifyItemInput {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  quantity: number;

  @Field(() => Number)
  price: number;
}

@InputType()
export class ClassifyItemAdd {
  @Field(() => String)
  _id: string;

  @Field(() => ClassifyItemInput)
  item: ClassifyItemInput;
}

@InputType()
export class ItemVariationInfo {
  @Field(() => String)
  name: string;

  @Field(() => String, {nullable: true})
  link?: string;
  
  @Field(() => Number)
  quantity: number;
  
  @Field(() => Number)
  price: number;
}

@InputType()
export class VariationInfo {
  @Field(() => String)
  nameDisplay: string;

  @Field(() => [ItemVariationInfo])
  dataIn: ItemVariationInfo[];
}
@InputType()
export class ItemLinkImage {
  @Field(() => String)
  name: string;

  @Field(() => String)
  image: string;
}

@InputType()
export class LinkImage {
  @Field(() => String)
  nameDisplay: string;

  @Field(() => [ItemLinkImage])
  dataIn: ItemLinkImage[];
}
