// import { Test, TestingModule } from '@nestjs/testing';
// import { ClassifyService } from './classify.service';

// import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import { ClassifySchema } from '../../shared/schemas/classify.schema';
// import { ProductSchema } from '../../shared/schemas/product.schema';
// import { WinstonModule } from 'nest-winston';

// let mongod: MongoMemoryServer;

// export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
//   MongooseModule.forRootAsync({
//     useFactory: async () => {
//       mongod = await MongoMemoryServer.create();
//       const mongoUri = mongod.getUri();
//       return {
//         uri: mongoUri,
//         ...options,
//       };
//     },
//   });

// export const closeInMongodConnection = async () => {
//   if (mongod) await mongod.stop();
// };

// describe('ClassifyService', () => {
//   let service: ClassifyService;

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [
//         rootMongooseTestModule(),
//         MongooseModule.forFeature([
//           { name: 'Classify', schema: ClassifySchema },
//           { name: 'Product', schema: ProductSchema },
//         ]),
//         WinstonModule.forRoot({}),
//       ],
//       providers: [ClassifyService],
//     }).compile();

//     service = module.get<ClassifyService>(ClassifyService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   afterAll(async () => {
//     await closeInMongodConnection();
//   });
// });
