import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sellerId: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: [String] })
  category: string[];

  @Prop({ type: [String], required: true })
  photos: string[];

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date })
  createAt: Date;

  @Prop({ required: false, default: false })
  deleted?: boolean;

  @Prop({ type: Number, default: 0 })
  minPrice?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
