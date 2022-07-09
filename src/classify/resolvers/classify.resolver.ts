import { ClassifyDto, ClassifyResponse } from './../dto/classify.dto';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ClassifyService } from '../services/classify.service';
import {
  ClassifyInput,
  FindByProductInput,
  FindClassifyInput,
  UpdateClassifyInput,
} from '../dto/inputs/classify.input';

@Resolver(() => ClassifyDto)
export class ClassifyResolver {
  constructor(private classifyService: ClassifyService) {}

  @Mutation(() => ClassifyResponse)
  async createClassify(@Args('input') input: ClassifyInput) {
    return this.classifyService.create(input);
  }

  @Query(() => ClassifyResponse)
  async findByProductId(@Args('input') input: FindByProductInput) {
    return this.classifyService.findByProduct(input.productId);
  }

  @Mutation(() => ClassifyResponse)
  async deleteClassify(@Args('input') input: FindClassifyInput): Promise<any> {
    return this.classifyService.delete(input._id);
  }

  @Mutation(() => ClassifyResponse)
  async updateClassify(@Args('input') input: UpdateClassifyInput) {
    return this.classifyService.updateClassify(input);
  }

  // @Mutation(() => ClassifyDto)
  // async addItem(@Args('input') input: ClassifyItemAdd) {
  //   return this.classifyService.add(input);
  // }
}
