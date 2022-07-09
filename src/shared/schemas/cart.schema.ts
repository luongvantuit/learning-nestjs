import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema()
export class Cart {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  productId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Classify' })
  classifyId: string;

  @Prop({ type: String })
  productName: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, default: 0 })
  quantity: number;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ default: false })
  statusOrder: boolean;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
