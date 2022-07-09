import { Product, ProductSchema } from './../shared/schemas/product.schema';
import { ClassifyResolver } from './resolvers/classify.resolver';
import { Classify, ClassifySchema } from './../shared/schemas/classify.schema';
import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassifyService } from './services/classify.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Classify.name, schema: ClassifySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [ClassifyResolver, ClassifyService],
  exports: [ClassifyService],
})
@Module({})
export class ClassifyModule {}
