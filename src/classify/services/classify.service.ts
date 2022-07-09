import { UpdateClassifyInput } from './../dto/inputs/classify.input';
import { ClassifyInput } from '../dto/inputs/classify.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Classify,
  ClassifyDocument,
} from './../../shared/schemas/classify.schema';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ClassifyResponse } from '../dto/classify.dto';
import { Product, ProductDocument } from '../../shared/schemas/product.schema';
import { ErrorCode, ErrorMessage } from '../../shared/enums/error';


@Injectable()
export class ClassifyService {
  constructor(
    @InjectModel(Classify.name) private classifyModel: Model<ClassifyDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * 
   * @param createClassify
   * @returns ClassifyResponse
   */
  async create(createClassify: ClassifyInput): Promise<ClassifyResponse> {
    const classify = await this.classifyModel.find({
      productId: createClassify.productId,
    });

    if (classify.length != 0) {
      throw "The product's classify already exists";
    }
    const product = await this.productModel.findById(createClassify.productId);
    if (product == null) {
      throw ErrorMessage.PRODUCT_INVALID;
    } else {
      const classify = new this.classifyModel({
        ...createClassify,
      });
      const save = await classify.save();
      const minP = save.variationInfo.dataIn.reduce(
        (minPrice, b) => Math.min(minPrice, b.price),
        save.variationInfo.dataIn[0].price,
      );

      product.minPrice = minP;
      product.save();

      return {
        data: {
          id: save._id,
          linkImage: save.linkImage,
          variationInfo: save.variationInfo,
          productId: product._id,
        },
        statusCode: ErrorCode.SUCCESS,
        errorMessage: ErrorMessage.SUCCESS,
      };
    }
  }

  /**
   *
   * @param productId
   * @returns
   */

  async findByProduct(productId: string): Promise<ClassifyResponse> {
    const classify = await this.classifyModel.find({
      productId: productId,
    });
    return {
      data: {
        id: classify[0]._id,
        linkImage: classify[0].linkImage,
        variationInfo: classify[0].variationInfo,
        productId: classify[0].productId,
      },
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   *
   * @param _id
   * @returns ClassifyResponse
   */
  async delete(_id: string): Promise<ClassifyResponse> {
    const classify = this.classifyModel.findById(_id);
    if (classify == null) {
      throw ErrorMessage.CLASSIFY_INVALID;
    }
    await this.classifyModel.deleteOne({ _id: new Types.ObjectId(_id) });
    return {
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   *
   * @param classifyUpdate
   * @returns ClassifyResponse
   */
  async updateClassify(classifyUpdate: UpdateClassifyInput) {
    const classifyUpd = await this.classifyModel.findById(classifyUpdate._id);
    if (classifyUpd == null) {
      throw ErrorMessage.CLASSIFY_INVALID;
    }
    classifyUpd.linkImage = classifyUpdate.linkImage;
    classifyUpd.variationInfo = classifyUpdate.variationInfo;
    classifyUpd.save();

    return {
      data: {
        id: classifyUpd._id,
        linkImage: classifyUpd.linkImage,
        variationInfo: classifyUpd.variationInfo,
        productId: classifyUpd._id,
      },
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  // async add(itemAdd: ClassifyItemAdd) {
  //   await this.classifyModel.update(
  //     { _id: itemAdd._id },
  //     { $push: { classify: itemAdd.item } },
  //   );
  //   return await this.classifyModel.findById(itemAdd._id);
  // }
}
