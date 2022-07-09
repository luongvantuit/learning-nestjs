import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ClassifyDocument = Classify & Document;

@Schema()
export class Classify {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  productId: string;

  @Prop({
    type: {
      nameDisplay: { type: String },
      dataIn: [
        {
          name: { type: String },
          image: { type: String },
        },
      ],
    },
  })
  linkImage?: {
    nameDisplay: string;
    dataIn: { name: string; image: string }[];
  };

  @Prop({
    type: {
      nameDisplay: { type: String },
      dataIn: [
        {
          name: { type: String },
          link: { type: String },
          quantity: { type: Number, default: 0 },
          price: { type: Number, default: 0 },
        },
      ],
    },
  })
  variationInfo: {
    nameDisplay: string;
    dataIn: { name: string; link?: string; quantity: number; price: number }[];
  };
}

export const ClassifySchema = SchemaFactory.createForClass(Classify);
