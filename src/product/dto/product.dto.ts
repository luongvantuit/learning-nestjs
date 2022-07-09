import { ClassifyDto } from '../../classify/dto/classify.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import DataResponse, {
  IDataResponse,
  IPaginationResponse,
  PaginationResponse,
} from '../../shared/schemas/response.model';

@ObjectType()
export class ProductDto {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  sellerId: string;

  @Field(() => String, { name: 'name' })
  name: string;

  @Field(() => [String])
  category: string[];

  @Field(() => [String])
  photos: string[];

  @Field(() => String)
  brand: string;

  @Field(() => String)
  description: string;

  @Field(() => Number)
  minPrice: number;

  @Field(() => Date)
  createAt: Date;
}

@ObjectType()
export class DetailedProductDto extends ProductDto {
  @Field(() => ClassifyDto)
  classifies: ClassifyDto;
}

@ObjectType()
export class ProductResponse extends DataResponse(DetailedProductDto) {}

@ObjectType()
export class ProductPaginationResponse
  extends DataResponse(PaginationResponse(ProductDto))
  implements IDataResponse<IPaginationResponse<ProductDto>>
{
  data: IPaginationResponse<ProductDto>;
  statusCode: string;
  errorMessage?: string;
}

@ObjectType()
export class ProductDetailDto {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  sellerId: string;

  @Field(() => String, { name: 'name' })
  name: string;

  @Field(() => [String])
  category: string[];

  @Field(() => [String])
  photos: string[];

  @Field(() => String)
  brand: string;

  @Field(() => String)
  description: string;

  @Field(() => [ClassifyDto])
  classifies: ClassifyDto[];

  @Field(() => Number)
  minPrice: number;
}
