import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { JwtAccessTokenDecorator } from 'src/shared/decorators/jwt-access-token.decorator';
import { JwtAccessTokenPayload } from 'src/shared/dto/payloads/jwt-access-token.payload';
import { ORDER_STATUS_ENUM } from 'src/shared/enums/order-status.enum';
import { JwtVerifyTokenGraphQLGuard } from 'src/shared/guards/jwt-verify-token-graphql.guard';
import { OrderModel } from './dto/models/order.model';
import { OrderService } from './order.service';

/**
 * @class Order Resolver handler request order
 * @function cancelOrder is mutation cancel order when status order is
 * @function updateOrder is mutation update status order
 */

@Resolver(() => OrderModel)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtVerifyTokenGraphQLGuard)
  @Mutation(() => Boolean, {
    name: 'cancelOrder',
    defaultValue: false,
  })
  async cancelOrder(
    @JwtAccessTokenDecorator() user: JwtAccessTokenPayload,
    @Args('orderId', {
      nullable: false,
      type: () => String,
    })
    orderId: string,
  ): Promise<boolean> {
    return this.orderService.cancelOrder(user, orderId);
  }

  @UseGuards(JwtVerifyTokenGraphQLGuard)
  @Mutation(() => Boolean, {
    name: 'updateOrder',
    defaultValue: false,
  })
  async updateOrder(
    @JwtAccessTokenDecorator() user: JwtAccessTokenPayload,
    @Args('orderId', {
      nullable: false,
      type: () => String,
    })
    orderId: string,
    @Args('status', {
      nullable: false,
      type: () => String,
    })
    status: ORDER_STATUS_ENUM,
  ): Promise<boolean> {
    return this.orderService.updateOrder(user, orderId, status);
  }

  @UseGuards(JwtVerifyTokenGraphQLGuard)
  @Query(() => OrderModel, {
    name: 'findOrder',
    nullable: true,
  })
  async findOrder(
    @JwtAccessTokenDecorator() user: JwtAccessTokenPayload,
    @Args('orderId', {
      nullable: false,
      type: () => String,
    })
    orderId: string,
  ): Promise<OrderModel> {
    return this.orderService.findOrder(user, orderId);
  }

  @UseGuards(JwtVerifyTokenGraphQLGuard)
  @Mutation(() => [OrderModel], {
    name: 'createOrder',
    nullable: true,
  })
  async createOrder(
    @JwtAccessTokenDecorator() user: JwtAccessTokenPayload,
    @Args('cartIds', {
      nullable: false,
      type: () => [String],
    })
    cartIds: string[],
  ): Promise<OrderModel[]> {
    return this.orderService.createOrder(user, cartIds);
  }
}
