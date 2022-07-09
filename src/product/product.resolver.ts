import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  ProductDetailDto,
  ProductDto,
  ProductPaginationResponse,
  ProductResponse,
} from './dto/product.dto';
import {
  FindProductInput,
  ProductInput,
  UpdateProductInput,
  SearchInput,
  ProductListInput,
} from './dto/inputs/product.input';
import { ProductService } from './product.service';

@Resolver(() => ProductDto)
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query(() => ProductPaginationResponse)
  async products(
    @Args('input') input: ProductListInput,
  ): Promise<ProductPaginationResponse> {
    return this.productService.findAll(input);
  }

  @Mutation(() => ProductResponse)
  async createProduct(
    @Args('input') input: ProductInput,
  ): Promise<ProductResponse> {
    return this.productService.create(input);
  }

  @Query(() => ProductResponse)
  async findOneProduct(@Args('input') input: FindProductInput) {
    return this.productService.findOne(input);
  }

  @Mutation(() => ProductResponse)
  async updateProduct(@Args('input') input: UpdateProductInput) {
    return this.productService.update(input);
  }

  @Mutation(() => String)
  async deleteProduct(@Args('input') input: FindProductInput): Promise<any> {
    return this.productService.delete(input._id);
  }

  @Query(() => [ProductDetailDto])
  async searchProduct(@Args() input: SearchInput) {
    return this.productService.search(input);
  }
}
