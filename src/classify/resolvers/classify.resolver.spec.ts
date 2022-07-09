// import { ErrorMessage, ErrorCode } from './../../shared/enums/error';
// import { ClassifyService } from './../services/classify.service';
// import { Test, TestingModule } from '@nestjs/testing';
// import { ClassifyResolver } from './classify.resolver';
// import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
// import { ClassifySchema } from '../../shared/schemas/classify.schema';
// import { ProductSchema } from '../../shared/schemas/product.schema';
// import { WinstonModule } from 'nest-winston';

// // let mongod: MongoMemoryServer;

// export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
//   MongooseModule.forRootAsync({
//     useFactory: async () => {
//       // mongod = await MongoMemoryServer.create();
//       const mongoUri = 'mongodb://localhost:27017/dev';
//       return {
//         uri: mongoUri,
//         ...options,
//       };
//     },
//   });

// describe('ClassifyResolver', () => {
//   let resolver: ClassifyResolver;
//   jest.setTimeout(30000);
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [
//         rootMongooseTestModule(),
//         MongooseModule.forFeature([
//           { name: 'Classify', schema: ClassifySchema },
//           { name: 'Product', schema: ProductSchema },
//         ]),
//         WinstonModule.forRoot({}),
//       ],
//       providers: [ClassifyResolver, ClassifyService],
//     }).compile();

//     resolver = module.get<ClassifyResolver>(ClassifyResolver);
//   });

//   it('should be defined', () => {
//     expect(resolver).toBeDefined();
//   });

//   let newClassify: any;
//   describe('create classify', () => {
//     it('throws an error when product not found', async () => {
//       try {
//         await resolver.createClassify({
//           productId: '621f2bdeaca7c2f7e9a855fc',
//           nameDisplay: 'text 2',
//           classify: [
//             { name: 'S', quantity: 5, price: 4 },
//             { name: 'M', quantity: 12, price: 4 },
//             { name: 'L', quantity: 12, price: 6 },
//           ],
//         });
//       } catch (e) {
//         console.log(e);
//         expect(e).toEqual(ErrorMessage.PRODUCT_INVALID);
//       }
//     });
//     const productId = '621f2bdeaca7c2f7e9a855fb';
//     it('create classify successful', async () => {
//       const classify = await resolver.createClassify({
//         productId: productId,
//         nameDisplay: 'text 2',
//         classify: [
//           { name: 'S', quantity: 5, price: 4 },
//           { name: 'M', quantity: 12, price: 4 },
//           { name: 'L', quantity: 12, price: 6 },
//         ],
//       });
//       newClassify = classify.data;
//       console.log(newClassify);
      
//       expect(classify.errorMessage).toEqual(ErrorMessage.SUCCESS);
//       expect(classify.statusCode).toEqual(ErrorCode.SUCCESS);
//     });

//     it('find classify', async () => {
//       const classify = await resolver.findByProductId({
//         productId: productId,
//       });
//       expect(classify.errorMessage).toEqual(ErrorMessage.SUCCESS);
//       expect(classify.statusCode).toEqual(ErrorCode.SUCCESS);
//     });
//   });

//   describe('update classify', () => {
//     it('update classify successful', async () => {      
//       const classify = await resolver.updateClassify({
//         _id: newClassify._id,
//         nameDisplay: 'text test update',
//         classify: [
//           { name: 'S test', quantity: 5, price: 4 },
//           { name: 'M', quantity: 12, price: 4 },
//           { name: 'L', quantity: 12, price: 6 },
//         ],
//       });
//       console.log(classify);
//       expect(classify.errorMessage).toEqual(ErrorMessage.SUCCESS);
//       expect(classify.statusCode).toEqual(ErrorCode.SUCCESS);
//     });
//   });

//   // describe('delete classify', () => {
//   //   it('delete one classify in list', async () => {
//   //     const classify = await resolver.deleteClassify({
//   //       _id: newClassify._id,
//   //     });
//   //     expect(classify.errorMessage).toEqual(ErrorMessage.SUCCESS);
//   //     expect(classify.statusCode).toEqual(ErrorCode.SUCCESS);
//   //   });
//   // });
// });
