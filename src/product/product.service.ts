import { ClassifyInput } from './../classify/dto/inputs/classify.input';
import { User, UserDocument } from './../shared/schemas/user.schema';
import { ClassifyService } from './../classify/services/classify.service';
import { ErrorMessage, ErrorCode } from './../shared/enums/error';
import {
  Classify,
  ClassifyDocument,
} from './../shared/schemas/classify.schema';
import {
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  ProductDetailDto,
  ProductDto,
  ProductPaginationResponse,
  ProductResponse,
} from './dto/product.dto';
import {
  FindProductInput,
  ProductInput,
  UpdateProductInput,
  SearchInput,
  ProductListInput,
} from './dto/inputs/product.input';
import { Product, ProductDocument } from '../shared/schemas/product.schema';

const ITEM_PER_PAGE = 5;

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Classify.name) private classifyModel: Model<ClassifyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    private readonly classifyService: ClassifyService,
  ) {}

  /**
   *
   * @param input have currentPage, filter search and range price
   * @returns response {items: productList, totalPage, currentPage}, error
   */

  async findAll(input: ProductListInput): Promise<ProductPaginationResponse> {
    const minP: { $gt?: number; $lt?: number } = {};
    if (input?.filterInput?.rangePrice?.min) {
      minP.$gt = input.filterInput.rangePrice.min;
    }
    if (input?.filterInput?.rangePrice?.max) {
      minP.$lt = input.filterInput.rangePrice.max;
    }

    const filterInput = input.filterInput.filter
      ? input.filterInput.filter
      : {};
    let match: any = {};
    if (filterInput !== {}) {
      const keyFilter = Object.keys(filterInput);
      for (const key of keyFilter) {
        match[key] = { $regex: `${filterInput[key]}`, $options: 'i' };
      }
    }

    if (minP.$gt || minP.$lt) {
      match = { minPrice: minP, ...match };
    }

    const productFilter = await this.productModel.aggregate([
      {
        $match: match,
      },
    ]);

    const query: any[] = [
      {
        $match: match,
      },
      {
        $sort: {
          minPrice: input?.filterInput?.rangePrice?.sort === 'ASC' ? 1 : -1,
        },
      },
      {
        $skip: (input.page - 1) * ITEM_PER_PAGE,
      },
      {
        $limit: ITEM_PER_PAGE,
      },
    ];
    const totalProducts = productFilter.length;
    const totalPage = Math.ceil(totalProducts / ITEM_PER_PAGE);
    const products = <ProductDto[]>await this.productModel.aggregate(query);

    return {
      data: {
        items: products,
        totalPage,
        currentPage: input.page,
      },
      statusCode: ErrorCode.SUCCESS,
    };
  }
  /**
   *
   * @param createProduct
   * @returns data new product, errorCode & errorMessage
   */

  async create(createProduct: ProductInput): Promise<ProductResponse> {
    const seller = await this.userModel.findById(createProduct.sellerId);
    if (seller == null) {
      throw 'invalid seller';
    }

    const prd = new this.productModel({
      ...createProduct,
    });
    prd.createAt = new Date();

    const minP = createProduct.classifies.variationInfo.dataIn.reduce(
      (minPrice, b) => Math.min(minPrice, b.price),
      createProduct.classifies.variationInfo.dataIn[0].price,
    );
    prd.minPrice = minP;

    const save = await prd.save();
    const classifyInp: ClassifyInput = createProduct.classifies;
    classifyInp.productId = prd._id;
    const classifies = await this.classifyService.create(classifyInp);

    this.logger.error(save);
    return {
      data: {
        _id: save._id,
        sellerId: save.sellerId,
        name: save.name,
        category: save.category,
        photos: save.photos,
        brand: save.brand,
        description: save.description,
        minPrice: save.minPrice,
        classifies: classifies.data,
      },
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   *
   * @param product product _id
   * @returns details product | exception product not found
   */
  async findOne(product: FindProductInput) {
    if (!isValidObjectId(product._id)) {
      throw 'invalid objectId';
    }
    const productRes = await this.productModel.findById(product._id);
    if (productRes == null) {
      throw 'Product not found';
    }

    const classifyDetails = await this.classifyService.findByProduct(
      productRes._id,
    );

    return {
      data: {
        _id: productRes._id,
        sellerId: productRes.sellerId,
        name: productRes.name,
        category: productRes.category,
        photos: productRes.photos,
        brand: productRes.brand,
        description: productRes.description,
        minPrice: productRes.minPrice,
        classifies: classifyDetails.data,
      },
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   *
   * @param updateProduct
   * @returns product updated
   */
  async update(updateProduct: UpdateProductInput) {
    const product = await this.productModel.findById(updateProduct._id);
    if (product == null) {
      throw ErrorMessage.PRODUCT_INVALID;
    }
    // throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    product.name = updateProduct.name;
    product.category = updateProduct.category;
    product.photos = updateProduct.photos;
    product.brand = updateProduct.brand;
    product.description = updateProduct.description;
    product.save();

    return {
      data: {
        _id: product._id,
        sellerId: product.sellerId,
        name: product.name,
        category: product.category,
        photos: product.photos,
        brand: product.brand,
        description: product.description,
        minPrice: product.minPrice,
      },
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   *
   * @param _id is Object id product
   * @returns
   */
  async delete(_id: string): Promise<any> {
    const findProd = await this.productModel.findById(_id);
    if (findProd == null) {
      throw ErrorMessage.PRODUCT_INVALID;
    }
    const classify = await this.classifyService.findByProduct(findProd._id);
    await this.classifyService.delete(classify.data.id);
    await this.productModel.deleteOne({ _id: new Types.ObjectId(_id) });

    return 'Product deleted!';
  }

  /**
   *
   * @param searchInp
   * @returns list details product search by name, filter by brand/category/price and/or sort by price
   */
  async search(searchInp: SearchInput) {
    let productSearch: ProductDetailDto[] = [];
    const minP: { $gt?: number; $lt?: number } = {};

    if (searchInp.min) {
      minP.$gt = searchInp.min;
    }
    if (searchInp.max) {
      minP.$lt = searchInp.max;
    }

    const match = {
      name: { $regex: `${searchInp.searchname}`, $options: 'i' },
      category: {
        $regex: `${searchInp.category ? searchInp.category : ''}`,
        $options: 'i',
      },
      brand: {
        $regex: `${searchInp.brand ? searchInp.brand : ''}`,
        $options: 'i',
      },
      minPrice: minP,
    };

    productSearch = await this.productModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: { minPrice: searchInp.sort === 'increase' ? 1 : -1 },
      },
    ]);
    const prods = [];
    for (const element of productSearch) {
      const classify = await this.classifyService.findByProduct(element._id);
      const resObject = {
        ...element,
        classifies: classify,
      };
      prods.push(resObject);
    }
    return prods;
  }
}
