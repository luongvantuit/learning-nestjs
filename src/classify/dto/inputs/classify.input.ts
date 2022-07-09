import { ClassifyItemInput, LinkImage, VariationInfo } from './classifyItem.input';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ClassifyInput {
  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => LinkImage, {nullable: true})
  linkImage?: LinkImage;

  @Field(() => VariationInfo)
  variationInfo: VariationInfo;
}

@InputType()
export class FindByProductInput {
  @Field(() => String)
  readonly productId: string;
}

@InputType()
export class FindClassifyInput {
  @Field(() => String)
  readonly _id: string;
}

@InputType()
export class UpdateClassifyInput {
  @Field(() => String)
  _id: string;

  @Field(() => LinkImage, {nullable: true})
  linkImage?: LinkImage;

  @Field(() => VariationInfo)
  variationInfo: VariationInfo;
}
