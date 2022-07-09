import { JwtModule } from '@nestjs/jwt';
import { ProductService } from './../product/product.service';
import { Cart, CartSchema } from './../shared/schemas/cart.schema';
import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { CartResolver } from './resolvers/cart.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/shared/schemas/product.schema';
import { Classify, ClassifySchema } from 'src/shared/schemas/classify.schema';
import { User, UserSchema } from 'src/shared/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Classify.name, schema: ClassifySchema },
      { name: User.name, schema: UserSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
    JwtModule.register({})
  ],
  providers: [CartService, CartResolver, ProductService]
})
export class CartModule {}
