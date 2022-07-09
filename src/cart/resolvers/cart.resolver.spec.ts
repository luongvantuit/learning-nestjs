import { CartSchema } from './../../shared/schemas/cart.schema';
import { CartService } from './../services/cart.service';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import { ClassifySchema } from '../../shared/schemas/classify.schema';
import { ProductSchema } from '../../shared/schemas/product.schema';
import { UserSchema } from '../../shared/schemas/user.schema';
import { CartResolver } from './cart.resolver';
import * as fs from 'fs';
import { ErrorCode, ErrorMessage } from '../../shared/enums/error';

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      // mongod = await MongoMemoryServer.create();
      const mongoUri = 'mongodb://localhost:27017/dev';
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

describe('CartResolver', () => {
  let resolver: CartResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'Product', schema: ProductSchema },
          { name: 'Classify', schema: ClassifySchema },
          { name: 'User', schema: UserSchema },
          { name: 'Cart', schema: CartSchema },
        ]),
        WinstonModule.forRoot({}),
      ],
      providers: [CartResolver, CartService],
    }).compile();

    resolver = module.get<CartResolver>(CartResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  let newCart : any;let listProduct: any;
  describe('add product to cart/ create cart', () => {
    it('add product to cart 1', async () => {
      const listProduct = await JSON.parse(fs.readFileSync('list_product.json', 'utf-8'));
      
      const cart = await resolver.createCart({
        userId: '623c82b186a76d62a7562895',
        productId: listProduct[0]._id,
        classifyId: listProduct[0].classifies.variationInfo.dataIn[0]._id,
        quantity: listProduct[0].classifies.variationInfo.dataIn[0].quantity,
      });
      // const cartCheck = await resolver.findCartItem({_id: cart.data._id});
      // const rest = cartCheck.data;
      // delete rest.productId;
      // console.log("REST", rest);
      // console.log("CART", cart.data);
      // expect(cart.data).toEqual(rest);
      expect(cart.errorMessage).toEqual(ErrorMessage.SUCCESS);
      expect(cart.statusCode).toEqual(ErrorCode.SUCCESS);
      expect(typeof cart.data).toEqual('object');
    });

    it('add product to cart 2', async () => {
      const listProduct = await JSON.parse(fs.readFileSync('list_product.json', 'utf-8'));
      
      const cart = await resolver.createCart({
        userId: '623c82b186a76d62a7562895',
        productId: listProduct[0]._id,
        classifyId: listProduct[0].classifies.variationInfo.dataIn[1]._id,
        quantity: listProduct[0].classifies.variationInfo.dataIn[1].quantity,
      });
      expect(cart.errorMessage).toEqual(ErrorMessage.SUCCESS);
      expect(cart.statusCode).toEqual(ErrorCode.SUCCESS);
      expect(typeof cart.data).toEqual('object');
    });

    it('add product to cart 3', async () => {
      listProduct = await JSON.parse(fs.readFileSync('list_product.json', 'utf-8'));
      
      const cart = await resolver.createCart({
        userId: '623c82b186a76d62a7562895',
        productId: listProduct[1]._id,
        classifyId: listProduct[1].classifies.variationInfo.dataIn[1]._id,
        quantity: listProduct[1].classifies.variationInfo.dataIn[1].quantity,
      });
      expect(cart.errorMessage).toEqual(ErrorMessage.SUCCESS);
      expect(cart.statusCode).toEqual(ErrorCode.SUCCESS);
      expect(typeof cart.data).toEqual('object');
      newCart = cart;
    });
  });
  it('update cart', async () => {    
    const res = await resolver.updateCart({
      _id: newCart.data._id,
      productId: newCart.data.productId,
      classifyId: listProduct[1].classifies.variationInfo.dataIn[1]._id,
      quantity: listProduct[1].classifies.variationInfo.dataIn[1].quantity - 1,
    });

    expect(res.errorMessage).toEqual(ErrorMessage.SUCCESS);
    expect(res.statusCode).toEqual(ErrorCode.SUCCESS);
    
  });

  it('find cart', async () => {
    const res = await resolver.findCarts({
      userId: "623c82b186a76d62a7562895"
    });      
    expect(res.errorMessage).toEqual(ErrorMessage.SUCCESS);
    expect(res.statusCode).toEqual(ErrorCode.SUCCESS);
  });
});
