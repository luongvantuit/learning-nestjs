import { MailService } from './../mail/mail.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtAccessTokenPayload } from 'src/shared/dto/payloads/jwt-access-token.payload';
import { Order, OrderDocument } from 'src/shared/schemas/order.schema';
import { Model } from 'mongoose';
import { ORDER_STATUS_ENUM } from 'src/shared/enums/order-status.enum';
import { OrderModel } from './dto/models/order.model';
import { Cart, CartDocument } from 'src/shared/schemas/cart.schema';
import { Product, ProductDocument } from 'src/shared/schemas/product.schema';
import mongoose from 'mongoose';
import { Classify, ClassifyDocument } from 'src/shared/schemas/classify.schema';
import { CartInterface } from './dto/interfaces/cart.interface';
import { SecurityService } from 'src/shared/security/security.service';
import { User } from 'src/shared/schemas/user.schema';
import { UserModel } from 'src/user/models/user.model';
import * as QRCode from 'qrcode';
import * as qrCode from 'qrcode-reader';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import { join } from 'path';
/**
 * @class OrderService
 * @function cancelOrder Handler cancel order when status order is pending payment or canceled
 * @function updateOrder Handler update status of order with order by seller or user
 * @function findOrder Handler get information of order with order Id return order success
 * @function createOrder Handler create order with list cart Id
 */
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly mailService: MailService,
    private readonly securityService: SecurityService,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Classify.name)
    private readonly classifyModel: Model<ClassifyDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserModel>,
  ) {}
  /**
   * Cancel order with order id
   * @param user payload after verify success access token
   * @param orderId is Id of order user or seller want update cancel status
   * @returns
   */
  async cancelOrder(
    user: JwtAccessTokenPayload,
    orderId: string,
  ): Promise<boolean> {
    const query = {
      _id: new mongoose.Types.ObjectId(orderId),
      status: {
        $in: [
          ORDER_STATUS_ENUM.CANCELED,
          ORDER_STATUS_ENUM.PENDING_PAYMENT,
          ORDER_STATUS_ENUM.PROGRESSING,
        ],
      },
    };
    // * Update one order with role user is seller or user
    const order = await this.orderModel.updateOne(
      {
        $or: [
          {
            sellerId: user.uid,
            ...query,
          },
          {
            userId: user.uid,
            ...query,
          },
        ],
      },
      {
        $set: {
          status: ORDER_STATUS_ENUM.CANCELED,
        },
      },
    );
    if (!order) {
      throw new NotFoundException('Not found information order');
    }
    return true;
  }

  /**
   * Update status of order with order Id
   * @param user payload of user after verify access token
   * @param orderId is order need update status
   * @param status is status of order after update
   * @returns
   */
  async updateOrder(
    user: JwtAccessTokenPayload,
    orderId: string,
    status: ORDER_STATUS_ENUM,
  ): Promise<boolean> {
    const query = {
      _id: new mongoose.Types.ObjectId(orderId),
    };
    const set = {
      $set: {
        status: status,
      },
    };
    let order;
    // * Seller can update from progressing to shipping
    if (status === ORDER_STATUS_ENUM.SHIPPING) {
      order = await this.orderModel.updateOne(
        {
          sellerId: user.uid,
          status: ORDER_STATUS_ENUM.PROGRESSING,
          ...query,
        },
        set,
      );
      // * User can update from complete -> refunded
    } else if (status === ORDER_STATUS_ENUM.REFUNDED) {
      order = await this.orderModel.updateOne(
        {
          userId: user.uid,
          status: ORDER_STATUS_ENUM.COMPLETE,
          ...query,
        },
        set,
      );
    }
    if (!order) {
      throw new NotFoundException('Not fund information order corresponding!');
    }
    return true;
  }

  /**
   * Find information of order with order Id
   * @param user information of user after verify access token
   * @param orderId  is order id corresponding
   * @returns
   */
  async findOrder(
    user: JwtAccessTokenPayload,
    orderId: string,
  ): Promise<OrderModel> {
    // * Aggregate information match order Id
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(orderId),
        },
      },
      // * Role is user or seller
      {
        $match: {
          $or: [
            {
              userId: user.uid,
            },
            {
              sellerId: user.uid,
            },
          ],
        },
      },
      // * Collection information of cart & product & classify
      {
        $lookup: {
          from: this.cartModel.collection.name,
          as: 'carts',
          localField: 'cartIds',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: this.productModel.collection.name,
                as: 'product',
                localField: 'productId',
                foreignField: '_id',
              },
            },
            {
              $set: {
                product: {
                  $arrayElemAt: ['$product', 0],
                },
              },
            },
            {
              $lookup: {
                from: this.classifyModel.collection.name,
                as: 'classify',
                localField: 'product._id',
                foreignField: 'productId',
              },
            },
            {
              $set: {
                classify: {
                  $arrayElemAt: ['$classify', 0],
                },
              },
            },
            {
              $set: {
                classify: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$classify.variationInfo.dataIn',
                        as: 'classifyTemp',
                        cond: {
                          $eq: ['$$classifyTemp._id', '$classifyId'],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
        },
      },
    ]);
    // * Get first element of array aggregate
    return orders.length !== 0 ? orders[0] : null;
  }

  /**
   * Create order with list cart Id
   * @param user  payload after verify access token
   * @param cartIds is list cart id need create order
   * @returns {Promise<OrderModel[]>}  information of list new order
   */
  async createOrder(
    user: JwtAccessTokenPayload,
    cartIds: string[],
  ): Promise<OrderModel[]> {
    const carts = <CartInterface[]>await this.cartModel.aggregate([
      {
        $set: {
          _id: {
            $toString: '$_id',
          },
        },
      },
      {
        $match: {
          _id: {
            $in: cartIds,
          },
          userId: new mongoose.Types.ObjectId(user.uid),
          statusOrder: false,
        },
      },
      // * Get information product by lookup
      {
        $lookup: {
          from: this.productModel.collection.name,
          as: 'product',
          localField: 'productId',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                deleted: false,
              },
            },
          ],
        },
      },
      {
        $set: {
          product: {
            $arrayElemAt: ['$product', 0],
          },
        },
      },
      // * Get information product by lookup
      {
        $lookup: {
          from: this.classifyModel.collection.name,
          as: 'classify',
          localField: 'product._id',
          foreignField: 'productId',
        },
      },
      {
        $set: {
          classify: {
            $arrayElemAt: ['$classify', 0],
          },
        },
      },
      // * Filter classify
      {
        $set: {
          classify: {
            $filter: {
              input: '$classify.variationInfo.dataIn',
              as: 'classifyTemp',
              cond: {
                $eq: ['$$classifyTemp._id', '$classifyId'],
              },
            },
          },
        },
      },
      {
        $set: {
          classify: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$classify',
                  as: 'classifyTemp',
                  cond: {
                    $gte: ['$$classifyTemp.quantity', '$quantity'],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      // * If null ignore element aggregate
      {
        $match: {
          classify: {
            $ne: null,
          },
        },
      },
      // * Information user seller
      {
        $lookup: {
          from: this.userModel.collection.name,
          as: 'seller',
          localField: 'product.sellerId',
          foreignField: '_id',
        },
      },
      {
        $set: {
          seller: {
            $arrayElemAt: ['$seller', 0],
          },
        },
      },
      {
        $match: {
          seller: {
            $ne: null,
          },
        },
      },
      // * Project handler property show
      {
        $project: {
          _id: 0,
          cartId: '$_id',
          userId: {
            $toString: '$userId',
          },
          quantity: '$quantity',
          sellerId: {
            $toString: '$product.sellerId',
          },
          amount: {
            $multiply: ['$quantity', '$classify.price'],
          },
          seller: {
            email: '$seller.email',
          },
          product: {
            productId: {
              $toString: '$product._id',
            },
            description: '$product.description',
            brand: '$product.brand',
            photos: '$product.photos',
            category: '$product.category',
            name: '$product.name',
            createAt: '$product.createAt',
          },
          classify: {
            classifyId: {
              $toString: '$classify._id',
            },
            name: '$classify.name',
            link: '$classify.link',
            price: '$classify.price',
          },
        },
      },
    ]);
    // * Aggregate cart Id
    const cartIdsPass: mongoose.Types.ObjectId[] = [];
    const orders: Map<
      string,
      {
        carts: CartInterface[];
      } & Order
    > = new Map();
    // * Aggregate information cart & update quantity for classify corresponding
    carts.forEach(async (cart) => {
      if (!orders.has(cart.sellerId)) {
        orders.set(cart.sellerId, {
          userId: user.uid,
          sellerId: cart.sellerId,
          totalAmount: cart.amount,
          cartIds: [cart.cartId],
          carts: [cart],
          createAt: new Date(Date.now()),
          status: ORDER_STATUS_ENUM.PENDING_PAYMENT,
        });
      } else {
        orders.get(cart.sellerId).totalAmount += cart.amount;
        orders.get(cart.sellerId).cartIds.push(cart.cartId);
        orders.get(cart.sellerId).carts.push(cart);
      }
      cartIdsPass.push(new mongoose.Types.ObjectId(cart.cartId));
      const classify: ClassifyDocument = await this.classifyModel.findOne({
        productId: cart.product.productId,
      });
      classify.variationInfo.dataIn.forEach((e: any) => {
        if (e._id.toString() === cart.classify.classifyId) {
          e.quantity = e.quantity - cart.quantity;
        }
      });
      await classify.save();
    });
    // * Update status order of cart
    await this.cartModel.updateMany(
      {
        _id: {
          $in: cartIdsPass,
        },
      },
      {
        $set: {
          statusOrder: true,
        },
      },
    );

    // * Create all order & collection order Id & Send information invoice
    const ordersCollection: any[] = [];
    await orders.forEach(async (value) => {
      ordersCollection.push(value);
      await this.mailService.senderUserInvoice(user, value);
    });
    const saveOrders = await this.orderModel.insertMany(ordersCollection);
    const saveOrderId = saveOrders.map((value) => value._id);
    // * Collection information of new order
    const ordersResponse = await this.orderModel.aggregate([
      {
        $match: {
          _id: {
            $in: saveOrderId,
          },
        },
      },
      {
        $lookup: {
          from: this.cartModel.collection.name,
          as: 'carts',
          localField: 'cartIds',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: this.productModel.collection.name,
                as: 'product',
                localField: 'productId',
                foreignField: '_id',
              },
            },
            {
              $set: {
                product: {
                  $arrayElemAt: ['$product', 0],
                },
              },
            },
            {
              $lookup: {
                from: this.classifyModel.collection.name,
                as: 'classify',
                localField: 'product._id',
                foreignField: 'productId',
              },
            },
            {
              $set: {
                classify: {
                  $arrayElemAt: ['$classify', 0],
                },
              },
            },
            {
              $set: {
                classify: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$classify.variationInfo.dataIn',
                        as: 'classifyTemp',
                        cond: {
                          $eq: ['$$classifyTemp._id', '$classifyId'],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    // await this.mailService.senderUserInvoice(user, ordersResponse);
    await ordersResponse.forEach(async (order) => {
      const filePath = join(process.cwd(), '/qrcode/', order._id.toString() + '.png')
      const buffer: Buffer = await this.securityService.generateEncrypted(
        order._id.toString(),
      );
      
      QRCode.toFile(
        join(process.cwd(), '/qrcode/', order._id.toString() + '.png'),
        buffer.toString()
      );
      
      console.log(filePath);
      const img = await Jimp.read(filePath);
      const a = await img.getBufferAsync(Jimp.MIME_PNG)
      const qr = new qrCode();
      console.log(await qr.decode(a));
      // if (fs.existsSync(filePath)) {
      //   const img = await Jimp.read(fs.readFileSync(filePath));
      //   const qr = new qrCode();
      //   const value = await new Promise((resolve, reject) => {
      //       qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
      //       qr.decode(img.bitmap);
      //   });
        // console.log(value);
        
    // }
      // await this.securityService.decrypted(a);
      // await this.securityService.decrypted(a);
      // await this.securityService.decrypted(a);

    });
    return <OrderModel[]>ordersResponse;
  }
}
