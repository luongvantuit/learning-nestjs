import {
  DeleteCartInput,
  UpdateCartInput,
  FindCartInput,
} from './../dto/input/cart.input';
import { CartDto } from './../dto/cart.dto';
import { JwtAccessTokenPayload } from 'src/shared/dto/payloads/jwt-access-token.payload';
import {
  VariationInfo,
  LinkImage,
} from './../../classify/dto/inputs/classifyItem.input';
import { ErrorCode, ErrorMessage } from './../../shared/enums/error';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Cart, CartDocument } from '../../shared/schemas/cart.schema';
import {
  Classify,
  ClassifyDocument,
} from '../../shared/schemas/classify.schema';
import { Product, ProductDocument } from '../../shared/schemas/product.schema';
import { User, UserDocument } from '../../shared/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CartInput } from '../dto/input/cart.input';
import { CartResponse } from '../dto/cart.dto';
import mongoose from 'mongoose';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Classify.name) private classifyModel: Model<ClassifyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * Create cart item: contains information about 1 product in the cart
   * @param input information create cart: seller, product, classify
   * @returns {Promise<CartResponse>} new product in cart has been created and creation status
   */
  async create(
    input: CartInput,
    // accessToken: JwtAccessTokenPayload,
  ): Promise<CartResponse> {
    const product = await this.productModel.findById(input.productId);
    if (product == null) {
      throw 'product invalid';
    }

    const classify = await this.classifyModel.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(input.productId) } },
      {
        $project: {
          'variationInfo.nameDisplay': 0,
          'linkImage._id': 0,
          'variationInfo._id': 0,
        },
      },
      { $unwind: '$variationInfo.dataIn' },
      {
        $match: {
          'variationInfo.dataIn._id': new mongoose.Types.ObjectId(
            input.classifyId,
          ),
          'variationInfo.dataIn.quantity': { $gte: input.quantity },
        },
      },
    ]);

    if (classify.length == 0) {
      throw 'Product quantity is not enough';
    }
    const cart = new this.cartModel({
      ...input,
    });
    if (classify[0].linkImage != null) {
      const variation = classify[0].variationInfo.dataIn;
      const linkImage = classify[0].linkImage.dataIn;
      const image = linkImage.find(
        (element) => element.name === variation.link,
      );
      cart.image = image.image;
    }
    cart.price = classify[0].variationInfo.dataIn.price;
    cart.productName = product.name;
    const save = await cart.save();
    this.logger.error(cart);

    return {
      data: {
        _id: save._id,
        // userId: accessToken.uid,
        userId: save.userId,
        productId: save.productId,
        classifyId: save.classifyId,
        productName: save.productName,
        statusOrder: save.statusOrder,
        quantity: save.quantity,
        price: save.price,
        image: save.image,
      },
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   * Update item in cart
   * @param input cart id, product information and information that needs updating
   * @returns {Promise<CartResponse>} product in cart has been updated and update status
   */
  async update(input: UpdateCartInput): Promise<CartResponse> {
    const cart = await this.cartModel.findById(input._id);
    if (cart == null) {
      throw 'Cart is invalid.';
    }
    const product = await this.productModel.findById(input.productId);
    if (product == null) {
      throw 'product invalid';
    }
    const classify = await this.classifyModel.aggregate([
      //* Find classify by productId
      { $match: { productId: new mongoose.Types.ObjectId(input.productId) } },
      
      //* Specifies the inclusion of field: {variationInfo.nameDisplay, linkImage._id,variationInfo._id}. Non-zero integers are also treated as true
      {
        $project: {
          'variationInfo.nameDisplay': 0,
          'linkImage._id': 0,
          'variationInfo._id': 0,
        },
      },

      //* Deconstructs an array field (variationInfo.dataIn) from the input documents to output a document for each element
      { $unwind: '$variationInfo.dataIn' },
      

      {
        $match: {
          'variationInfo.dataIn._id': new mongoose.Types.ObjectId(
            input.classifyId,
          ),
          'variationInfo.dataIn.quantity': { $gte: input.quantity },
        },
      },
    ]);

    if (classify.length == 0) {
      throw 'Product quantity is not enough';
    }

    if (classify[0].linkImage != null) {
      const variation = classify[0].variationInfo.dataIn;
      const linkImage = classify[0].linkImage.dataIn;
      const image = linkImage.find(
        (element) => element.name === variation.link,
      );
      cart.image = image.image;
    }
    cart.classifyId = input.classifyId;
    cart.price = classify[0].variationInfo.dataIn.price;
    cart.productName = product.name;
    cart.quantity = input.quantity;
    cart.save();
    this.logger.error(cart);
    return {
      data: {
        _id: cart._id,
        // userId: accessToken.uid,
        userId: cart.userId,
        productId: cart.productId,
        classifyId: cart.classifyId,
        productName: cart.productName,
        statusOrder: cart.statusOrder,
        quantity: cart.quantity,
        price: cart.price,
        image: cart.image,
      },
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  async delete(_id: string): Promise<CartResponse> {
    const cart = await this.cartModel.findById(_id);
    this.logger.error(cart);
    if (cart == null) {
      throw 'Cart is invalid.';
    }
    await this.cartModel.deleteOne({ _id: new Types.ObjectId(_id) });
    return {
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   * Find user's cart
   * @param input user id
   * @returns {Promise<CartResponse>} products in cart and find status
   */
  async findCart(input: FindCartInput): Promise<CartResponse> {
    const carts = await this.cartModel.find({
      userId: input.userId,
      statusOrder: false,
    });
    if (carts.length === 0) {
      return {
        data: [],
        statusCode: ErrorCode.SUCCESS,
        errorMessage: ErrorMessage.SUCCESS,
      };
    }
    this.logger.error(carts);

    return {
      data: carts,
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }

  /**
   * Find cart item
   * @param input cart id
   * @returns {Promise<CartResponse>} product in cart and find status
   */
  async findItem(_id: string): Promise<CartResponse> {
    const cart = await this.cartModel.findById(_id);
    this.logger.error(cart);
    if (cart == null) {
      throw 'Cart is invalid.';
    }
    return {
      data: cart,
      statusCode: ErrorCode.SUCCESS,
      errorMessage: ErrorMessage.SUCCESS,
    };
  }
}
