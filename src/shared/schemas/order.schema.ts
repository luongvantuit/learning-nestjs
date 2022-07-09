import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ORDER_STATUS_ENUM } from '../enums/order-status.enum';

@Schema({
  validateBeforeSave: true,
})
export class Order {
  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    required: true,
  })
  cartIds: string[];

  @Prop({
    type: String,
    required: true,
  })
  sellerId: string;

  @Prop({
    type: String,
  })
  orderNumber?: string;

  @Prop({
    type: Date,
    required: true,
    default: '$now',
  })
  createAt: Date;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  totalAmount: number;

  @Prop({
    type: String,
    required: true,
    default: ORDER_STATUS_ENUM.PENDING_PAYMENT,
  })
  status: ORDER_STATUS_ENUM;

  @Prop({
    type: String,
  })
  paymentId?: string;

  @Prop({
    type: String,
  })
  shipping?: string;
}

export type OrderDocument = Order & mongoose.Document;

export const OrderSchema = SchemaFactory.createForClass(Order);
