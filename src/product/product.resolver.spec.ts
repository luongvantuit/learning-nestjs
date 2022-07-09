import { UserSchema } from '../shared/schemas/user.schema';
import { ErrorMessage, ErrorCode } from './../shared/enums/error';
import { ClassifyService } from './../classify/services/classify.service';
import { ClassifyResolver } from './../classify/resolvers/classify.resolver';
import { ProductService } from './product.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductResolver } from './product.resolver';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ClassifySchema } from '../shared/schemas/classify.schema';
import { ProductSchema } from '../shared/schemas/product.schema';
import { WinstonModule } from 'nest-winston';
import * as fs from 'fs';

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

describe('ProductResolver', () => {
  let resolver: ProductResolver;
  //let service: ProductService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: 'Product', schema: ProductSchema },
          { name: 'Classify', schema: ClassifySchema },
          { name: 'User', schema: UserSchema },
        ]),
        WinstonModule.forRoot({}),
      ],
      providers: [
        ProductResolver,
        ProductService,
        ClassifyService,
        ClassifyResolver,
      ],
    }).compile();

    resolver = module.get<ProductResolver>(ProductResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  let newProduct: any;
  const listProduct: any = [];
  describe('create product', () => {
    it('create new product 1', async () => {
      const product = await resolver.createProduct({
        sellerId: '6239bfec31675139aad4a174',
        name: 'shirt',
        category: ['shirt'],
        photos: ['shirt.jpg'],
        brand: 'VN',
        description: 'shirt',
        classifies: {
          linkImage: {
            nameDisplay: 'Color',
            dataIn: [
              {
                name: 'White',
                image: 'white.jpg',
              },
              {
                name: 'Black',
                image: 'black.jpg',
              },
            ],
          },
          variationInfo: {
            nameDisplay: 'Size',
            dataIn: [
              {
                name: 'S',
                link: 'White',
                quantity: 10,
                price: 100,
              },
              {
                name: 'S',
                link: 'Black',
                quantity: 10,
                price: 100,
              },
              {
                name: 'M',
                link: 'White',
                quantity: 10,
                price: 70,
              },
              {
                name: 'M',
                link: 'Black',
                quantity: 10,
                price: 120,
              },
            ],
          },
        },
      });
      listProduct.push(product.data);
      expect(product.errorMessage).toEqual(ErrorMessage.SUCCESS);
      expect(product.statusCode).toEqual(ErrorCode.SUCCESS);
      expect(typeof product.data).toEqual('object');
    });

    it('create new product 2', async () => {
      const product = await resolver.createProduct({
        sellerId: '6239bfec31675139aad4a174',
        name: 'skirt',
        category: ['skirt'],
        photos: ['shirt.jpg'],
        brand: 'UK',
        description: 'skirt',
        classifies: {
          linkImage: {
            nameDisplay: 'Color',
            dataIn: [
              {
                name: 'Red Plaid',
                image: 'Red.jpg',
              },
              {
                name: 'Black Plaid',
                image: 'Black.jpg',
              },
            ],
          },
          variationInfo: {
            nameDisplay: 'Size',
            dataIn: [
              {
                name: 'S',
                link: 'Red Plaid',
                quantity: 20,
                price: 30,
              },
              {
                name: 'S',
                link: 'Black Plaid',
                quantity: 20,
                price: 50,
              },
              {
                name: 'M',
                link: 'Red Plaid',
                quantity: 15,
                price: 70,
              },
              {
                name: 'M',
                link: 'Black Plaid',
                quantity: 15,
                price: 120,
              },
            ],
          },
        },
      });
      // newProduct = product.data;
      listProduct.push(product.data);
      expect(product.errorMessage).toEqual(ErrorMessage.SUCCESS);
      expect(product.statusCode).toEqual(ErrorCode.SUCCESS);
      expect(typeof product.data).toEqual('object');
    });

    it('create new product 3', async () => {
      const product = await resolver.createProduct({
        sellerId: '6239bfec31675139aad4a174',
        name: 'dress',
        category: ['dress'],
        photos: ['dress.jpg'],
        brand: 'USA',
        description: 'dress',
        classifies: {
          linkImage: {
            nameDisplay: 'Color',
            dataIn: [
              {
                name: 'Beige',
                image: 'Beige.jpg',
              },
              {
                name: 'Black',
                image: 'Black.jpg',
              },
              {
                name: 'Blue',
                image: 'Blue.jpg',
              },
            ],
          },
          variationInfo: {
            nameDisplay: 'Size',
            dataIn: [
              {
                name: 'S',
                link: 'Beige',
                quantity: 20,
                price: 80,
              },
              {
                name: 'S',
                link: 'Black',
                quantity: 10,
                price: 90,
              },
              {
                name: 'S',
                link: 'Blue',
                quantity: 20,
                price: 100,
              },
              {
                name: 'M',
                link: 'Beige',
                quantity: 15,
                price: 90,
              },
              {
                name: 'M',
                link: 'Black',
                quantity: 5,
                price: 120,
              },
              {
                name: 'M',
                link: 'Blue',
                quantity: 15,
                price: 100,
              },
            ],
          },
        },
      });
      listProduct.push(product.data);
      newProduct = product.data;
      expect(product.errorMessage).toEqual(ErrorMessage.SUCCESS);
      expect(product.statusCode).toEqual(ErrorCode.SUCCESS);
      expect(typeof product.data).toEqual('object');
      fs.writeFile('list_product.json', JSON.stringify(listProduct, null, 4), (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('File successfully written');
        }
      });
    });
  });

  describe('find one product', () => {
    it('find valid product', async () => {
      const res = await resolver.findOneProduct({ _id: newProduct._id });

      expect(res.errorMessage).toEqual(ErrorMessage.SUCCESS);
      expect(res.statusCode).toEqual(ErrorCode.SUCCESS);
      expect(typeof res.data).toEqual('object');
    });
  });

  it('update product', async () => {
    console.log(newProduct._id);
    const res = await resolver.updateProduct({
      _id: newProduct._id,
      name: 'product update',
      category: ['watches'],
      photos: ['watches.jpg'],
      brand: 'USA',
      description: 'watch',
    });

    expect(res.errorMessage).toEqual(ErrorMessage.SUCCESS);
    expect(res.statusCode).toEqual(ErrorCode.SUCCESS);
  });

  it('search and filter product', async () => {
    const res = await resolver.products({
      page: 2,
      filterInput: {
        filter: { name: 'skirt' },
        rangePrice: { max: 10, min: 0, sort: 'ASC' },
      },
    });
    expect(res.statusCode).toEqual(ErrorCode.SUCCESS);
  });

  it('delete product', async () => {
    const res = await resolver.deleteProduct({ _id: newProduct._id });
    expect(res).toEqual('Product deleted!');
  });
});
