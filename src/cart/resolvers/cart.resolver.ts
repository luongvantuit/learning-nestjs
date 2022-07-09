import {
  DeleteCartInput,
  FindCartInput,
  UpdateCartInput,
} from './../dto/input/cart.input';
import { JwtAccessTokenPayload } from 'src/shared/dto/payloads/jwt-access-token.payload';
import { CartDto, CartsResponse } from './../dto/cart.dto';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CartResponse } from '../dto/cart.dto';
import { CartInput } from '../dto/input/cart.input';
import { CartService } from '../services/cart.service';
import { JwtAccessTokenDecorator } from 'src/shared/decorators/jwt-access-token.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtVerifyTokenGraphQLGuard } from 'src/shared/guards/jwt-verify-token-graphql.guard';

@Resolver(() => CartDto)
export class CartResolver {
  constructor(private cartService: CartService) {}

  // @UseGuards(JwtVerifyTokenGraphQLGuard)
  @Mutation(() => CartResponse)
  async createCart(
    @Args('input') input: CartInput,
    // @JwtAccessTokenDecorator() accessToken: JwtAccessTokenPayload
  ): Promise<CartResponse> {
    // return this.cartService.create(input, accessToken)
    return this.cartService.create(input);
  }

  @Mutation(() => CartResponse)
  async updateCart(@Args('input') input: UpdateCartInput) {
    return this.cartService.update(input);
  }

  @Mutation(() => CartResponse)
  async deleteCart(@Args('input') input: DeleteCartInput) {
    return this.cartService.delete(input._id);
  }

  @Query(() => CartsResponse)
  async findCarts(@Args('input') input: FindCartInput) {
    return this.cartService.findCart(input);
  }

  @Query(() => CartResponse)
  async findCartItem(@Args('input') input: DeleteCartInput) {
    return this.cartService.findItem(input._id);
  }
}
  