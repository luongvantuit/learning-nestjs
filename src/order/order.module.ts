import { SecurityService } from './../shared/security/security.service';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/shared/schemas/order.schema';
import { Cart, CartSchema } from 'src/shared/schemas/cart.schema';
import { Product, ProductSchema } from 'src/shared/schemas/product.schema';
import { Classify, ClassifySchema } from 'src/shared/schemas/classify.schema';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { User, UserSchema } from 'src/shared/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Classify.name,
        schema: ClassifySchema,
      },

      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    JwtModule.register({}),
    MailModule,
  ],
  providers: [OrderService, OrderResolver, SecurityService],
})
export class OrderModule {}
