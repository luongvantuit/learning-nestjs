import { Classify, ClassifySchema } from './../shared/schemas/classify.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../shared/schemas/product.schema';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { User, UserSchema } from '../shared/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Classify.name, schema: ClassifySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ProductResolver, ProductService],
})
export class ProductModule {}
